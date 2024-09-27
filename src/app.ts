import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import estudianteRouter from "./routes/estudianteRouter";
import cursoRouter from "./routes/cursosRouter";
import inscripcionRouter from "./routes/inscripcionRouter";
import profesorRouter from "./routes/profesorRouteR";

import methodOverride from "method-override";

const app = express();

//habilitamos pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
//carpeta pblica
app.use(express.static("public"));

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  return res.render("layout", {
    pagina: "App Univerdsidad",
  });
});
app.use("/estudiantes", estudianteRouter);
app.use("/cursos", cursoRouter);
app.use("/inscripciones", inscripcionRouter);
app.use("/profesores", profesorRouter);

export default app;
