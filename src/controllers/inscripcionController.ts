import { Request, Response } from "express";
import { AppDataSource } from "../db/conexion";
import { CursoEstudiante } from "../models/CursoEstudianteModel";
import { Estudiante } from "../models/EstudianteModel";
import { Curso } from "../models/CursoModel";

export const consultarInscripciones = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const inscripciones = await AppDataSource.getRepository(
      CursoEstudiante
    ).find({
      relations: ["estudiante", "curso"],
    });

    res.render("listarInscripciones", {
      pagina: "Listar Inscripciones",
      inscripciones,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const consultarxAlumno = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { estudiante_id } = req.params;
  try {
    const inscripciones = await AppDataSource.getRepository(
      CursoEstudiante
    ).find({
      where: { estudiante: { id: parseInt(estudiante_id) } },
      relations: ["curso"],
    });
    res.json(inscripciones);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const consultarxCurso = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { curso_id } = req.params;
  try {
    const inscripciones = await AppDataSource.getRepository(
      CursoEstudiante
    ).find({
      where: { curso: { id: parseInt(curso_id) } },
      relations: ["estudiante"],
    });
    res.json(inscripciones);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const inscribir = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { estudiante_id, curso_id } = req.body;
  try {
    const estudiante = await AppDataSource.getRepository(Estudiante).findOne({
      where: { id: parseInt(estudiante_id) },
    });
    const curso = await AppDataSource.getRepository(Curso).findOne({
      where: { id: parseInt(curso_id) },
    });

    if (!estudiante || !curso) {
      return res
        .status(404)
        .json({ mensaje: "Estudiante o Curso no encontrado" });
    }

    const nuevaInscripcion = AppDataSource.getRepository(
      CursoEstudiante
    ).create({
      estudiante,
      curso,
    });

    await AppDataSource.getRepository(CursoEstudiante).save(nuevaInscripcion);

    return res.redirect("/inscripciones/listarInscripciones");
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const cancelarInscripcion = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { estudiante_id, curso_id } = req.params;
  try {
    const inscripcion = await AppDataSource.getRepository(
      CursoEstudiante
    ).findOne({
      where: {
        estudiante: { id: parseInt(estudiante_id) },
        curso: { id: parseInt(curso_id) },
      },
    });

    if (!inscripcion) {
      return res.status(404).json({ mensaje: "Inscripción no encontrada" });
    }

    await AppDataSource.getRepository(CursoEstudiante).remove(inscripcion);
    res.json({ mensaje: "Inscripción cancelada con éxito" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const calificar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { estudiante_id, curso_id } = req.params;
  const { nota } = req.body;

  try {
    if (nota < 1 || nota > 10) {
      return res.status(400).send("La calificación debe estar entre 1 y 10.");
    }

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
      return res.status(404).json({ mensaje: "Inscripción no encontrada" });
    }

    inscripcion.nota = nota;
    await AppDataSource.getRepository(CursoEstudiante).save(inscripcion);

    res.redirect("/inscripciones/listarInscripciones");
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};
