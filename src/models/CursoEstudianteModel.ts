import { Column, PrimaryColumn, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Curso } from "./CursoModel";
import { Estudiante } from "./EstudianteModel";

@Entity("cursos_estudiantes")
export class CursoEstudiante {
  @PrimaryColumn()
  estudiante_id: number;

  @PrimaryColumn()
  curso_id: number;

  @Column({ type: "float", default: 0 })
  nota: number;

  @Column({ type: Date, default: () => "CURRENT_DATE" })
  fecha: Date;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.cursos)
  @JoinColumn({ name: "estudiante_id" })
  estudiante: Estudiante;

  @ManyToOne(() => Curso, (curso) => curso.estudiantes)
  @JoinColumn({ name: "curso_id" })
  curso: Curso;
}
