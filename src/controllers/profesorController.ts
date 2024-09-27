import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { Profesor } from "../models/ProfesorModel";
import { AppDataSource } from "../db/conexion";

var profesores: Profesor[];

export const validar = () => [
  check("dni")
    .notEmpty()
    .withMessage("El DNI es obligatorio")
    .isLength({ min: 7 })
    .withMessage("El DNI debe tener al menos 7 caracteres"),
  check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El Nombre debe tener al menos 3 caracteres"),
  check("apellido")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El Apellido debe tener al menos 3 caracteres"),
  check("email").isEmail().withMessage("Debe proporcionar un email válido"),
  check("profesion").notEmpty().withMessage("La profesión es obligatoria"),
  check("telefono").notEmpty().withMessage("El teléfono es obligatorio"),
  (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.render("creaProfesores", {
        pagina: "Crear Profesor",
        errores: errores.array(),
      });
    }
    next();
  },
];

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const profesorRepository = AppDataSource.getRepository(Profesor);
    profesores = await profesorRepository.find();
    res.render("listarProfesores", {
      pagina: "Lista de Profesores",
      profesores,
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
): Promise<Profesor | null> => {
  const { id } = req.params;
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw new Error("ID inválido, debe ser un número");
  }
  try {
    const profesorRepository = AppDataSource.getRepository(Profesor);
    const profesor = await profesorRepository.findOne({
      where: { id: idNumber },
    });
    if (!profesor) {
      return null;
    }
    return profesor;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error("Error al buscar el profesor: " + err.message);
    }
    return null;
  }
};

export const insertar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { dni, nombre, apellido, email, profesion, telefono } = req.body;

  try {
    const profesorRepository = AppDataSource.getRepository(Profesor);

    const profesorExistente = await profesorRepository.findOne({
      where: { dni },
    });

    if (profesorExistente) {
      return res.status(400).render("crearProfesores", {
        pagina: "Registrar Profesor",
        errores: [{ msg: "El DNI ya está registrado" }],
      });
    }

    const nuevoProfesor = profesorRepository.create({
      dni,
      nombre,
      apellido,
      email,
      profesion,
      telefono,
    });

    await profesorRepository.save(nuevoProfesor);
    return res.status(201).redirect("/profesores/listarProfesores");
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
  const { dni, nombre, apellido, email, profesion, telefono } = req.body;

  try {
    const profesorRepository = AppDataSource.getRepository(Profesor);
    const profesor = await profesorRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!profesor) {
      return res.status(404).json({ mensaje: "Profesor no encontrado" });
    }

    profesorRepository.merge(profesor, {
      dni,
      nombre,
      apellido,
      email,
      profesion,
      telefono,
    });
    await profesorRepository.save(profesor);

    res.redirect("/profesores/listarProfesores");
  } catch (error) {
    console.error("Error al modificar el profesor:", error);
    return res.status(500).send("Error del servidor");
  }
};

export const eliminar = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  try {
    const profesorRepository = AppDataSource.getRepository(Profesor);
    const deleteResult = await profesorRepository.delete(id);

    if (deleteResult.affected === 1) {
      return res.json({ mensaje: "Profesor eliminado" });
    } else {
      return res.status(404).json({ mensaje: "Profesor no encontrado" });
    }
  } catch (err) {
    return res.status(500).json({ mensaje: "Error al eliminar el profesor" });
  }
};
