/**
 * Identicraft - Minecraft Avatar Rendering Library
 * Copyright (c) 2026 Shengwei Xiong
 * Licensed under the MIT License
 */

import {
  resolveUUID,
  getSkinURL,
  renderAvatar,
  renderCube,
  renderBody,
  renderBust,
  getSkin,
  PlayerNotFoundError,
  MojangRateLimitError
} from './lib/minecraft.js';

class Identicraft {
  /**
   * Resolve a Minecraft username to UUID
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @returns {Promise<string>} UUID without dashes
   */
  static async resolveUUID(usernameOrUUID) {
    return await resolveUUID(usernameOrUUID);
  }

  /**
   * Get skin URL from UUID
   * @param {string} uuid - Minecraft UUID
   * @returns {Promise<string|null>} Skin texture URL
   */
  static async getSkinURL(uuid) {
    return await getSkinURL(uuid);
  }

  /**
   * Render 2D avatar head
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @param {number} size - Size in pixels (8-512)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async renderAvatar(usernameOrUUID, size = 512) {
    const uuid = await resolveUUID(usernameOrUUID);
    const skinURL = await getSkinURL(uuid);
    if (!skinURL) throw new Error('Skin not found');
    return await renderAvatar(skinURL, size);
  }

  /**
   * Render 3D isometric cube head
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @param {number} size - Size in pixels (8-512)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async renderCube(usernameOrUUID, size = 512) {
    const uuid = await resolveUUID(usernameOrUUID);
    const skinURL = await getSkinURL(uuid);
    if (!skinURL) throw new Error('Skin not found');
    return await renderCube(skinURL, size);
  }

  /**
   * Render full body
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @param {number} size - Size in pixels (8-512)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async renderBody(usernameOrUUID, size = 512) {
    const uuid = await resolveUUID(usernameOrUUID);
    const skinURL = await getSkinURL(uuid);
    if (!skinURL) throw new Error('Skin not found');
    return await renderBody(skinURL, size);
  }

  /**
   * Render bust (half body)
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @param {number} size - Size in pixels (8-512)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async renderBust(usernameOrUUID, size = 512) {
    const uuid = await resolveUUID(usernameOrUUID);
    const skinURL = await getSkinURL(uuid);
    if (!skinURL) throw new Error('Skin not found');
    return await renderBust(skinURL, size);
  }

  /**
   * Get raw skin texture
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async getSkin(usernameOrUUID) {
    const uuid = await resolveUUID(usernameOrUUID);
    const skinURL = await getSkinURL(uuid);
    if (!skinURL) throw new Error('Skin not found');
    return await getSkin(skinURL);
  }

  /**
   * Render any type
   * @param {string} type - Render type (avatar, cube, body, bust, skin)
   * @param {string} usernameOrUUID - Minecraft username or UUID
   * @param {number} size - Size in pixels (8-512)
   * @returns {Promise<Buffer>} PNG image buffer
   */
  static async render(type, usernameOrUUID, size = 512) {
    switch (type.toLowerCase()) {
      case 'avatar':
        return await this.renderAvatar(usernameOrUUID, size);
      case 'cube':
        return await this.renderCube(usernameOrUUID, size);
      case 'body':
        return await this.renderBody(usernameOrUUID, size);
      case 'bust':
        return await this.renderBust(usernameOrUUID, size);
      case 'skin':
        return await this.getSkin(usernameOrUUID);
      default:
        throw new Error(`Invalid render type: ${type}`);
    }
  }
}

export default Identicraft;
export {
  Identicraft,
  resolveUUID,
  getSkinURL,
  renderAvatar,
  renderCube,
  renderBody,
  renderBust,
  getSkin,
  PlayerNotFoundError,
  MojangRateLimitError
};