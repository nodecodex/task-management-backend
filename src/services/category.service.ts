import { Category } from '@prisma/client';
import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator.js';

export class CategoryService {
  public async getCategories(): Promise<Category[]> {
    return categoryRepository.findAll();
  }

  public async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
    }
    return category;
  }

  public async createCategory(input: CreateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError('Category with this name already exists');
    }
    return categoryRepository.create(input);
  }

  public async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    if (input.name !== existing.name) {
      const nameTaken = await categoryRepository.findByName(input.name);
      if (nameTaken && nameTaken.id !== id) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    return categoryRepository.update(id, input);
  }

  public async deleteCategory(id: string): Promise<Category> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found', ERROR_CODES.CATEGORY_NOT_FOUND);
    }
    return categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
