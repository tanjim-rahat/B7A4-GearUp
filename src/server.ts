import app from "./app";

const main = async () => {
  const PORT = process.env.PORT || 3333;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

main().catch((error) => {
  console.error("Error starting the server:", error);
  process.exit(1);
});
