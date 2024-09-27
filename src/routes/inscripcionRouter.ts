import express from "express";
import { AppDataSource } from "../db/conexion";
import { CursoEstudiante } from "../models/CursoEstudianteModel";
const router = express.Router();
import {
  calificar,
  cancelarInscripcion,
  consultarInscripciones,
  consultarxAlumno,
  consultarxCurso,
  inscribir,
} from "../controllers/inscripcionController";
import { Estudiante } from "../models/EstudianteModel";
import { Curso } from "../models/CursoModel";
import { Like } from "typeorm";

router.get("/listarInscripciones", consultarInscripciones);

router.get("/buscarPorAlumno", async (req, res) => {
  const { nombre } = req.query;
  try {
    const inscripciones = await AppDataSource.getRepository(
      CursoEstudiante
    ).find({
      where: {
        estudiante: {
          nombre: Like(`%${nombre}%`),
        },
      },
      relations: ["estudiante", "curso"],
    });

    res.render("listarInscripciones", {
      pagina: "Buscar Inscripciones por Alumno",
      inscripciones,
    });
  } catch (error) {
    console.error("Error al buscar inscripciones por estudiante:", error);
    res.status(500).send("Error del servidor");
  }
});

router.get("/buscarPorCurso", async (req, res) => {
  const { nombre } = req.query;
  try {
    const inscripciones = await AppDataSource.getRepository(
      CursoEstudiante
    ).find({
      where: {
        curso: {
          nombre: Like(`%${nombre}%`),
        },
      },
      relations: ["estudiante", "curso"],
    });

    res.render("listarInscripciones", {
      pagina: "Buscar Inscripciones por Curso",
      inscripciones,
    });
  } catch (error) {
    console.error("Error al buscar inscripciones por curso:", error);
    res.status(500).send("Error del servidor");
  }
});

router.get("/registrarInscripcion", async (req, res) => {
  try {
    const estudiantes = await AppDataSource.getRepository(Estudiante).find();
    const cursos = await AppDataSource.getRepository(Curso).find();

    res.render("registrarInscripcion", {
      pagina: "Registrar Inscripción",
      estudiantes,
      cursos,
    });
  } catch (error) {
    console.error("Error al cargar estudiantes y cursos:", error);
    res.status(500).send("Error del servidor");
  }
});

router.post("/", inscribir);

router.get(
  "/modificarInscripcion/:estudiante_id/:curso_id",
  async (req, res) => {
    const { estudiante_id, curso_id } = req.params;
    try {
      const inscripcion = await AppDataSource.getRepository(
        CursoEstudiante
      ).findOne({
        where: {
          estudiante: { id: parseInt(estudiante_id) },
          curso: { id: parseInt(curso_id) },
        },
        relations: ["estudiante", "curso"],
      });

      if (!inscripcion) {
        return res.status(404).send("Inscripción no encontrada");
      }

      res.render("modificarInscripcion", {
        pagina: "Modificar Inscripción",
        inscripcion,
      });
    } catch (error) {
      console.error("Error al cargar la vista de modificación:", error);
      res.status(500).send("Error del servidor");
    }
  }
);

router.get("/calificar/:estudiante_id/:curso_id", async (req, res) => {
  const { estudiante_id, curso_id } = req.params;
  try {
    const inscripcion = await AppDataSource.getRepository(
      CursoEstudiante
    ).findOne({
      where: {
        estudiante: { id: parseInt(estudiante_id) },
        curso: { id: parseInt(curso_id) },
      },
      relations: ["estudiante", "curso"],
    });

    if (!inscripcion) {
      return res.status(404).send("Inscripción no encontrada");
    }

    res.render("calificarInscripcion", {
      pagina: "Calificar Estudiante",
      inscripcion,
    });
  } catch (error) {
    console.error("Error al cargar la vista de calificación:", error);
    res.status(500).send("Error del servidor");
  }
});

router.put("/calificar/:estudiante_id/:curso_id", calificar);

router.delete("/:estudiante_id/:curso_id", cancelarInscripcion);

export default router;
