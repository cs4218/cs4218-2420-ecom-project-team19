import app from "./app.js";
import colors from "colors";

const PORT = process.env.PORT || 6060;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(
      `Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white
    );
  });
}
