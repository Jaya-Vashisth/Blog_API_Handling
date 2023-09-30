const express = require("express");
const l = require("lodash");
const { memoize } = require("lodash");

const PORT = process.env.PORT || 3000;

app = express();

app.use(express.json());

app.use(async (req, res, next) => {
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
    req.blogsBag = blogsBag;
  } catch (err) {
    console.log("Error in fetching the Data", error);
    res.status(500).json({
      errr: "An error occured while fetching the data",
    });
  }

  next();
});

//routes
app.get("/api/blog-stats", async (req, res) => {
  try {
    blogsBag = req.blogsBag;

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

    res.status(200).json({
      status: "success",
      data: {
        totalBlogs: numberOfBlogs,
        longestBlogTitle: longestTitle,
        privacyBlog: privacyBlogNumbers,
        uniqueTitles: uniqueTitles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

//handle the query
app.get("/api/blog-search", (req, res) => {
  const query = req.query.query;
  const blogsBag = req.blogsBag;

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
