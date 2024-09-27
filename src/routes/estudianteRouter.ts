import express from "express";
import {
  insertar,
  modificar,
  eliminar,
  validar,
  consultarUno,
  consultarTodos,
} from "../controllers/estudianteController";

const router = express.Router();

router.get("/listarEstudiantes", consultarTodos);

router.get("/crearEstudiantes", (req, res) => {
  res.render("crearEstudiantes", {
    pagina: "Crear Estudiante",
    errores: [],
  });
});
router.post("/", validar(), insertar);

router.get("/modificarEstudiante/:id", async (req, res) => {
  try {
    const estudiante = await consultarUno(req, res);
    if (!estudiante) {
      return res.status(404).send("Estudiante no encontrado");
    }
    res.render("modificarEstudiante", {
      estudiante,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
});
router.put("/modificarEstudiante/:id", modificar);

router.delete("/:id", eliminar);

export default router;
