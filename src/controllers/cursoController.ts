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

    // Intentar obtener los profesores de la base de datos
    const profesores = await profesorRepository.find();

    // Depuración: verificar si se obtienen los profesores
    if (profesores && profesores.length > 0) {
      console.log("Profesores obtenidos:", profesores);
    } else {
      console.log("No se encontraron profesores.");
    }

    // Renderizar la vista con la lista de profesores
    res.render("crearCurso", {
      pagina: "Crear Curso",
      profesores: profesores || [], // Asegurarse de pasar un array vacío si no hay profesores
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

    // Incluir la relación con el profesor
    const cursos = await cursoRepository.find({
      relations: ["profesor"], // Asegúrate de traer la relación con profesores
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
      relations: ["profesor"], // Incluir el profesor relacionado
    });

    if (!curso) {
      // No retornar, solo enviar la respuesta 404
      res.status(404).send("Curso no encontrado");
      return;
    }

    // Renderizar la vista de modificar curso con los datos del curso
    res.render("modificarCurso", {
      pagina: "Modificar Curso",
      curso,
      profesores: await AppDataSource.getRepository(Profesor).find(), // Obtener lista de profesores para cambiar si es necesario
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

    // Verificar si se ha seleccionado un profesor
    if (!id_profesor) {
      return res.status(400).json({ mensaje: "Debes seleccionar un profesor" });
    }

    // Buscar el profesor en la base de datos
    const profesor = await profesorRepository.findOne({
      where: { id: parseInt(id_profesor) },
    });

    if (!profesor) {
      return res.status(404).json({ mensaje: "Profesor no encontrado" });
    }

    // Crear un nuevo curso con el profesor asociado
    const nuevoCurso = cursoRepository.create({
      nombre,
      descripcion,
      profesor, // Asignar el profesor al curso
    });

    await cursoRepository.save(nuevoCurso);

    // Redirigir a la lista de cursos después de crear el curso
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
  const { id_profesor } = req.body; // Ahora solo permitimos modificar el profesor

  try {
    const cursoRepository = AppDataSource.getRepository(Curso);
    const profesorRepository = AppDataSource.getRepository(Profesor);

    // Buscar el curso que se va a modificar
    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["profesor"],
    });

    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    // Buscar el profesor por ID si se proporciona
    if (id_profesor) {
      const profesor = await profesorRepository.findOne({
        where: { id: parseInt(id_profesor) },
      });
      if (!profesor) {
        return res.status(404).json({ mensaje: "Profesor no encontrado" });
      }
      curso.profesor = profesor; // Asignar el nuevo profesor al curso
    }

    // Guardar los cambios
    await cursoRepository.save(curso);

    // Redirigir a la página de listar cursos después de modificar
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
