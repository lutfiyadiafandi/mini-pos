import { Category } from "../models/Category.js";
import { CategoryRepository } from "../repositories/CategoryRepository.js";
import { ValidationError } from "../errors/AppError.js";

/**
 * Service layer untuk Category.
 * Business rules divalidasi di sini, BUKAN di repository.
 *
 * Repository bertanggung jawab: "bagaimana menyimpan/mengambil data?"
 * Service bertanggung jawab: "apakah operasi ini valid secara bisnis?"
 */
export class CategoryService {
  /**
   * Constructor Injection repository diberikan dari luar.
   * Ini memudahkan testing (bisa inject mock repository).
   */
  constructor(private categoryRepo: CategoryRepository) {}

  getAllCategories(): Category[] {
    return this.categoryRepo.findAll();
  }

  getCategoryById(id: number): Category {
    return this.categoryRepo.findById(id);
  }

  searchCategories(keyword: string): Category[] {
    if (keyword || keyword.trim().length === 0) {
      return this.categoryRepo.findAll();
    }
    return this.categoryRepo.search(keyword.trim());
  }

  createCategory(data: { name: string; description?: string }): Category {
    if (!data.name || data.name.trim().length === 0)
      throw new ValidationError("Nama kategori tidak boleh kosong");

    return this.categoryRepo.create(data);
  }

  updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
  ): Category {
    return this.categoryRepo.update(id, data);
  }

  deleteCategory(id: number): void {
    this.categoryRepo.delete(id);
  }
}
