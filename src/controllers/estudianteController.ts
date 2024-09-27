import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { Estudiante } from "../models/EstudianteModel";
import { AppDataSource } from "../db/conexion";
import { CursoEstudiante } from "../models/CursoEstudianteModel";

var estudiantes: Estudiante[];

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
  (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.render("creaEstudiantes", {
        pagina: "Crear Estudiante",
        errores: errores.array(),
      });
    }
    next();
  },
];

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    estudiantes = await estudianteRepository.find();
    res.render("listarEstudiantes", {
      pagina: "Lista de Estudiantes",
      estudiantes,
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
): Promise<Estudiante | null> => {
  const { id } = req.params;
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw new Error("ID inválido, debe ser un número");
  }
  try {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const estudiante = await estudianteRepository.findOne({
      where: { id: idNumber },
    });
    if (!estudiante) {
      return null;
    }
    return estudiante;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error("Error al buscar el estudiante: " + err.message);
    }
    return null;
  }
};

export const insertar = async (req: Request, res: Response): Promise<void> => {
  const { dni, nombre, apellido, email } = req.body;
  try {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const nuevoEstudiante = estudianteRepository.create({
      dni,
      nombre,
      apellido,
      email,
    });
    await estudianteRepository.save(nuevoEstudiante);
    res.redirect("/estudiantes/listarEstudiantes");
  } catch (error) {
    console.error("Error al insertar estudiante:", error);
    res.status(500).send("Error del servidor");
  }
};

export const modificar = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;
  const { dni, nombre, apellido, email } = req.body;
  try {
    const estudianteRepository = AppDataSource.getRepository(Estudiante);
    const estudiante = await estudianteRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }

    // Actualiza el estudiante
    estudianteRepository.merge(estudiante, { dni, nombre, apellido, email });
    await estudianteRepository.save(estudiante);

    // Redirige a la lista de estudiantes después de modificar, sin "return"
    res.redirect("/estudiantes/listarEstudiantes");
  } catch (error) {
    console.error("Error al modificar el estudiante:", error);
    return res.status(500).send("Error del servidor");
  }
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const cursosEstudiantesRepository =
        transactionalEntityManager.getRepository(CursoEstudiante);
      const estudianteRepository =
        transactionalEntityManager.getRepository(Estudiante);

      const cursosRelacionados = await cursosEstudiantesRepository.count({
        where: { estudiante: { id: Number(id) } },
      });
      if (cursosRelacionados > 0) {
        throw new Error("Estudiante cursando materias, no se puede eliminar");
      }
      const deleteResult = await estudianteRepository.delete(id);

      if (deleteResult.affected === 1) {
        return res.json({ mensaje: "Estudiante eliminado" });
      } else {
        throw new Error("Estudiante no encontrado");
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ mensaje: err.message });
    } else {
      res.status(400).json({ mensaje: "Error" });
    }
  }
};
