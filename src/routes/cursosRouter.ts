import express from "express";
import { AppDataSource } from "../db/conexion";
const router = express.Router();
import {
  consultarTodos,
  consultarUno,
  eliminar,
  insertar,
  modificar,
  mostrarFormularioCrearCurso,
} from "../controllers/cursoController";
import { Curso } from "../models/CursoModel";
import { Profesor } from "../models/ProfesorModel";

router.get("/crearCurso", mostrarFormularioCrearCurso);

router.post("/", insertar);

router.get("/listarCursos", consultarTodos);

router.get("/modificarCurso/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const cursoRepository = AppDataSource.getRepository(Curso);
    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profesor"],
    });

    if (!curso) {
      return res.status(404).send("Curso no encontrado");
    }

    const profesores = await AppDataSource.getRepository(Profesor).find();
    res.render("modificarCurso", {
      pagina: "Modificar Curso",
      curso,
      profesores,
    });
  } catch (error) {
    console.error("Error al cargar la vista de modificación:", error);
    res.status(500).send("Error del servidor");
  }
});

router.put("/:id", modificar);

router.delete("/:id", eliminar);

export default router;
