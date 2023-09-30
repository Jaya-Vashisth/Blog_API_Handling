const express = require("express");
const dotenv = require("dotenv");
const l = require("lodash");
const { memoize } = require("lodash");

dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 3000;

app = express();

app.use(express.json());

//fuction fetch the data From the API
const fetchData = async () => {
  try {
    //defining header and method
    const options = {
      method: "GET",
      headers: {
        "x-hasura-admin-secret":
          "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
      },
    };

    //get response
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      options
    );

    if (!response.ok) {
      console.log(`${response.status}`);
      return res.status(503).json({
        error: "Service Unavailable",
      });
    }

    //fetch data
    const blogsBag = await response.json();

    //put it in request for further processing by other routes
    return blogsBag;
  } catch (err) {
    console.log("Error in fetching the Data", error);
    res.status(500).json({
      errr: "An error occured while fetching the data",
    });
  }
};

//function to compute the stats for Blogs
const analyzedInfo = (blogsBag) => {
  //number of blogs
  const numberOfBlogs = l.size(blogsBag.blogs);

  //blog with longest title
  const longestTitle = l.maxBy(
    blogsBag.blogs,
    (blog) => blog.title.length
  ).title;

  //blog having word privacy in there title
  const privacyBlog = l.filter(blogsBag.blogs, (blog) =>
    l.includes(l.lowerCase(blog.title), "privacy")
  );

  //number of blogs containing word privacy
  const privacyBlogNumbers = l.size(privacyBlog);

  //unique titles
  const uniqueTitles = l.uniq(l.map(blogsBag.blogs, "title"));

  return {
    totalBlogs: numberOfBlogs,
    longestBlogTitle: longestTitle,
    privacyBlog: privacyBlogNumbers,
    uniqueTitles: uniqueTitles,
  };
};

//memoizing stats for 10 minutes
const memoizedStats = memoize(analyzedInfo, () => "cacheKey", 10 * 60 * 1000);

//middleware to calculate the stats again if timeout else pass the results
const midCache = async (req, res, next) => {
  try {
    //if memoizedstats time out
    if (!memoizedStats.cache.cacheKey) {
      const blogsBag = await fetchData();
      const blogStats = analyzedInfo(blogsBag);

      //again store in cache
      memoizedStats.cache.cacheKey = blogStats;
    }

    //add results in request for further processing
    req.blogStats = memoizedStats.cache.cacheKey;

    next();
  } catch (err) {
    console.log("Erron while fething and getting stats", err);
    res.status(500).json({
      status: "failed",
      error: err,
    });
  }
};

/////////////////////////////////////////// ROUTES ////////////////////////////////////////

//1) For stats
app.get("/api/blog-stats", midCache, async (req, res) => {
  try {
    const blogStats = req.blogStats;

    res.status(200).json({
      status: "success",
      data: blogStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

//2) Handle query
app.get("/api/blog-search", (req, res) => {
  const query = req.query.query;
  const blogsBag = fetchData();

  if (!query) {
    return res.status(400).json({
      error: "Query Parameter is required !",
    });
  }

  //get the results
  const matchingResults = l.filter(blogsBag.blogs, (blog) =>
    l.includes(l.lowerCase(blog.title), l.lowerCase(query))
  );

  res.status(200).json({
    status: "success",
    data: {
      matchingResults,
    },
  });
});

//handle routes that are not define
app.use("*", (req, res) => {
  return res.status(400).json({
    status: "Failed",
    message: `Cann't find ${req.originalUrl} on the server`,
  });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
