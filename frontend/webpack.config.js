module.exports = {
  // ...existing code...
  devServer: {
    // ...existing code...
    setupMiddlewares: (middlewares, devServer) => {
      // Custom middleware setup
      return middlewares;
    }
  }
  // ...existing code...
};
