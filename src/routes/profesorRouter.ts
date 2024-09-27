import express from "express";
const router = express.Router();
import {
  consultarTodos,
  consultarUno,
  eliminar,
  insertar,
  modificar,
  validar,
} from "../controllers/profesorController";

router.get("/crearProfesores", (req, res) => {
  res.render("crearProfesores", {
    pagina: "Crear Profesor",
  });
});

router.post("/", validar(), insertar);

router.get("/listarProfesores", consultarTodos);

router.get("/modificarProfesor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profesor = await consultarUno(req, res);
    if (!profesor) {
      return res.status(404).send("Profesor no encontrado");
    }
    res.render("modificarProfesor", {
      pagina: "Modificar Profesor",
      profesor,
    });
  } catch (error) {
    console.error("Error al cargar la vista de modificación:", error);
    res.status(500).send("Error del servidor");
  }
});

router.put("/:id", validar(), modificar);

router.delete("/:id", eliminar);

export default router;
