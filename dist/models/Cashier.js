"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cashier = void 0;
const User_1 = require("./User");
class Cashier extends User_1.User {
    /**
     * Daftar fitur yang bisa diakses oleh Cashier.
     * Static karena berlaku untuk semua instance Cashier.
     */
    static ALLOWED_FEATURES = [
        "transaction",
        "view_products",
        "view_categories",
    ];
    constructor(id, username, password, fullName) {
        super(id, username, password, fullName);
    }
    getPermissionsList() {
        return Cashier.ALLOWED_FEATURES;
    }
    getRole() {
        return "CASHIER";
    }
    /**
     * Cashier hanya punya akses ke fitur yang ada di ALLOWED_FEATURES.
     */
    hasAccess(feature) {
        return Cashier.ALLOWED_FEATURES.includes(feature);
    }
}
exports.Cashier = Cashier;
