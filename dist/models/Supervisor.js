"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supervisor = void 0;
const User_1 = require("./User");
class Supervisor extends User_1.User {
    /**
     * Daftar fitur yang bisa diakses oleh Supervisor.
     * Static karena berlaku untuk semua instance Supervisor.
     */
    static ALLOWED_FEATURES = [
        "transaction",
        "view_products",
        "view_categories",
        "view_reports",
    ];
    constructor(id, username, password, fullName) {
        super(id, username, password, fullName);
    }
    getPermissionsList() {
        return Supervisor.ALLOWED_FEATURES;
    }
    getRole() {
        return "SUPERVISOR";
    }
    /**
     * Supervisor hanya punya akses ke fitur yang ada di ALLOWED_FEATURES.
     */
    hasAccess(feature) {
        return Supervisor.ALLOWED_FEATURES.includes(feature);
    }
}
exports.Supervisor = Supervisor;
