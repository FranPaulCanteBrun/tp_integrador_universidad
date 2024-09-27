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

// Ruta para mostrar el formulario de crear curso
router.get("/crearCurso", mostrarFormularioCrearCurso);

// Ruta para crear un curso (POST)
router.post("/", insertar);

// Ruta para listar todos los cursos
router.get("/listarCursos", consultarTodos);

// Ruta para modificar un curso
router.get("/modificarCurso/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el curso por ID incluyendo la relación con profesor
    const cursoRepository = AppDataSource.getRepository(Curso);
    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profesor"], // Aseguramos traer el profesor relacionado
    });

    if (!curso) {
      return res.status(404).send("Curso no encontrado");
    }

    // Renderizar la vista de modificar curso con los datos del curso y los profesores
    const profesores = await AppDataSource.getRepository(Profesor).find();
    res.render("modificarCurso", {
      pagina: "Modificar Curso",
      curso,
      profesores, // Lista de profesores para seleccionar en el formulario
    });
  } catch (error) {
    console.error("Error al cargar la vista de modificación:", error);
    res.status(500).send("Error del servidor");
  }
});

// Ruta para actualizar un curso (PUT)
router.put("/:id", modificar);

// Ruta para eliminar un curso
router.delete("/:id", eliminar);

export default router;
