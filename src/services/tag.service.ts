import { Tag } from '@prisma/client';
import { tagRepository } from '../repositories/tag.repository.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/index.js';
import { CreateTagInput, UpdateTagInput } from '../validators/tag.validator.js';

export class TagService {
  public async getTags(): Promise<Tag[]> {
    return tagRepository.findAll();
  }

  public async getTagById(id: string): Promise<Tag> {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag not found', ERROR_CODES.TAG_NOT_FOUND);
    }
    return tag;
  }

  public async createTag(input: CreateTagInput): Promise<Tag> {
    const existing = await tagRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError('Tag with this name already exists');
    }
    return tagRepository.create(input);
  }

  public async updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Tag not found', ERROR_CODES.TAG_NOT_FOUND);
    }

    if (input.name && input.name !== existing.name) {
      const nameTaken = await tagRepository.findByName(input.name);
      if (nameTaken && nameTaken.id !== id) {
        throw new ConflictError('Tag with this name already exists');
      }
    }

    return tagRepository.update(id, input);
  }

  public async deleteTag(id: string): Promise<Tag> {
    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Tag not found', ERROR_CODES.TAG_NOT_FOUND);
    }
    return tagRepository.delete(id);
  }
}

export const tagService = new TagService();
