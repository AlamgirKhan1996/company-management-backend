import * as createCompanyService from "../services/companyService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";
export const createCompany = async (req, res) => {
  try {
    const { companyName, companyEmail } = req.body;
    const company = await createCompanyService.createCompany(companyName, companyEmail, req.user.id);
    logger.info(`✅ Company created successfully: ${company.id}`);
    await Cache.del(CacheKeys.companies.all);
    res.status(201).json({ company });
  } catch (err) {
    logger.error(`❌ Error creating company: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};