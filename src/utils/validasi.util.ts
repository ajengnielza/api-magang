import { ValidationError as ClassValidatorError } from "class-validator";
import { FieldError } from "./AppError";

export function ratakan(
  errors: ClassValidatorError[],
  awalan: string = ""
): FieldError[] {
  return errors.flatMap((e) => {
    const field = awalan ? `${awalan}.${e.property}` : e.property;

    const pesanSendiri: FieldError[] = Object.entries(e.constraints ?? {}).map(
      ([jenis, pesan]) => ({
        field,
        pesan: jenis === "whitelistValidation" ? "Properti ini tidak diizinkan" : pesan,
      })
    );

    const pesanAnak = e.children?.length ? ratakan(e.children, field) : [];

    return [...pesanSendiri, ...pesanAnak];
  });
}