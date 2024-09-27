import { Request, Response } from "express";
import { AppDataSource } from "../db/conexion";
import { Curso } from "../models/CursoModel";
import { Profesor } from "../models/ProfesorModel";
import { Estudiante } from "../models/EstudianteModel";

export const mostrarFormularioCrearCurso = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log(
      "Ejecutando controlador para cargar el formulario de crear curso..."
    );

    const profesorRepository = AppDataSource.getRepository(Profesor);

    const profesores = await profesorRepository.find();

    if (profesores && profesores.length > 0) {
      console.log("Profesores obtenidos:", profesores);
    } else {
      console.log("No se encontraron profesores.");
    }

    res.render("crearCurso", {
      pagina: "Crear Curso",
      profesores: profesores || [],
    });
  } catch (error) {
    console.error("Error al intentar obtener profesores:", error);
    res.status(500).send("Error del servidor");
  }
};

export const consultarTodos = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const cursoRepository = AppDataSource.getRepository(Curso);

    const cursos = await cursoRepository.find({
      relations: ["profesor"],
    });

    console.log(cursos);

    return res.render("listarCursos", {
      pagina: "Listar Cursos",
      cursos,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const consultarUno = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const cursoRepository = AppDataSource.getRepository(Curso);
    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profesor"],
    });

    if (!curso) {
      res.status(404).send("Curso no encontrado");
      return;
    }

    res.render("modificarCurso", {
      pagina: "Modificar Curso",
      curso,
      profesores: await AppDataSource.getRepository(Profesor).find(),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const insertar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { nombre, descripcion, id_profesor } = req.body;

  try {
    const cursoRepository = AppDataSource.getRepository(Curso);
    const profesorRepository = AppDataSource.getRepository(Profesor);

    if (!id_profesor) {
      return res.status(400).json({ mensaje: "Debes seleccionar un profesor" });
    }

    const profesor = await profesorRepository.findOne({
      where: { id: parseInt(id_profesor) },
    });

    if (!profesor) {
      return res.status(404).json({ mensaje: "Profesor no encontrado" });
    }

    const nuevoCurso = cursoRepository.create({
      nombre,
      descripcion,
      profesor,
    });

    await cursoRepository.save(nuevoCurso);

    return res.redirect("/cursos/listarCursos");
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const modificar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;
  const { id_profesor } = req.body;

  try {
    const cursoRepository = AppDataSource.getRepository(Curso);
    const profesorRepository = AppDataSource.getRepository(Profesor);

    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profesor"],
    });

    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    if (id_profesor) {
      const profesor = await profesorRepository.findOne({
        where: { id: parseInt(id_profesor) },
      });
      if (!profesor) {
        return res.status(404).json({ mensaje: "Profesor no encontrado" });
      }
      curso.profesor = profesor;
    }

    await cursoRepository.save(curso);

    return res.redirect("/cursos/listarCursos");
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const eliminar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;
  try {
    const cursoRepository = AppDataSource.getRepository(Curso);
    const deleteResult = await cursoRepository.delete(id);

    if (deleteResult.affected === 1) {
      return res.json({ mensaje: "Curso eliminado" });
    } else {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};
