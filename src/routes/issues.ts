import { Router } from "express";
import { postNewIssue } from "../controllers/issues";
import validarJWT from "../middlewares/validarJWT";
import { recolectarErrores } from "../middlewares/recolectarErrores";
import isAdmin from "../middlewares/validarRol";
import { check } from "express-validator";

const routerIssues = Router();

routerIssues.post(
  "/",
  [
    validarJWT,
    isAdmin,
    check("title", "El titulo es obligatorio").not().isEmpty(),
    check("description", "La descripción es obligatoria").not().isEmpty(),
    check("priority", "La prioridad es obligatoria").not().isEmpty(),
    recolectarErrores,
  ],
  postNewIssue
);

export default routerIssues;
