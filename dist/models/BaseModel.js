"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
class BaseModel {
    _id;
    _createdAt;
    constructor(id) {
        if (id < 0)
            throw new Error("ID tidak boleh negatif");
        this._id = id;
        this._createdAt = new Date();
    }
    get id() {
        return this._id;
    }
    get createdAt() {
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
exports.BaseModel = BaseModel;
