"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const User_1 = require("./User");
class Admin extends User_1.User {
    constructor(id, username, password, fullName) {
        super(id, username, password, fullName);
    }
    getPermissionsList() {
        return [
            "manage_users",
            "transaction",
            "view_products",
            "view_categories",
            "view_reports",
        ];
    }
    /**
     * Admin selalu return "ADMIN".
     */
    getRole() {
        return "ADMIN";
    }
    /**
     * Admin punya akses ke SEMUA fitur.
     */
    hasAccess(_feature) {
        return true;
    }
    toString() {
        const status = this.isActive ? "Active" : "Inactive";
        return `[SUPER${this.getRole()}#${this.id}] ${this.username} (${this.fullName}) | ${status}`;
    }
}
exports.Admin = Admin;
