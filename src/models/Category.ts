import { BaseModel } from "./BaseModel";

export class Category extends BaseModel {
  private _name: string;
  private _description: string;

  constructor(id: number, name: string, description: string = "") {
    super(id);

    if (!name || name.trim().length === 0) {
      throw new Error("Nama kategori tidak boleh kosong");
    }

    this._name = name.trim();
    this._description = description.trim();
  }

  // Getter
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  // Setter dengan validasi
  set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Nama kategori tidak boleh kosong");
    }
    this._name = value.trim();
  }

  set description(value: string) {
    this._description = value.trim();
  }

  // Method
  override toString(): string {
    return `[Category#${this._id}] ${this._name}`;
  }
}
