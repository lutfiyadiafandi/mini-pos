"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const BaseModel_1 = require("./BaseModel");
class Category extends BaseModel_1.BaseModel {
    _name;
    _description;
    constructor(id, name, description = "") {
        super(id);
        if (!name || name.trim().length === 0) {
            throw new Error("Nama kategori tidak boleh kosong");
        }
        this._name = name.trim();
        this._description = description.trim();
    }
    // Getter
    get name() {
        return this._name;
    }
    get description() {
        return this._description;
    }
    // Setter dengan validasi
    set name(value) {
        if (!value || value.trim().length === 0) {
            throw new Error("Nama kategori tidak boleh kosong");
        }
        this._name = value.trim();
    }
    set description(value) {
        this._description = value.trim();
    }
    // Method
    toString() {
        return `[Category#${this._id}] ${this._name}`;
    }
}
exports.Category = Category;
