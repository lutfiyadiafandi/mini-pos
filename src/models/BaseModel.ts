export class BaseModel {
  protected _id: number;
  protected _createdAt: Date;

  constructor(id: number) {
    if (id < 0) throw new Error("ID tidak boleh negatif");
    this._id = id;
    this._createdAt = new Date();
  }

  get id(): number {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Default toString - bisa di override oleh subclass.
   * Menggunakan constuctor name untuk mendapatkan nama class secara dinamis.
   */
  toString() {
    return `${this.constructor.name}#${this._id}`;
  }
}
