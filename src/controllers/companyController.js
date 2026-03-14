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

export const getCompanies = async (req, res) => {
    try {
        const cached = await Cache.get(CacheKeys.companies.all);
        if (cached) {
            logger.info("✅ Returning cached companies");
            return res.status(200).json({ companies: cached });
        }

        const companies = await createCompanyService.getAllCompanies();
        await Cache.set(CacheKeys.companies.all, companies);
        res.status(200).json({ companies });
    } catch (err) {
        logger.error(`❌ Error fetching companies: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await createCompanyService.getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.status(200).json({ company });
    } catch (err) {
        logger.error(`❌ Error fetching company: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyName, companyEmail } = req.body;
        const company = await createCompanyService.getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        const updatedCompany = await createCompanyService.updateCompany(id, companyName, companyEmail);
        await Cache.del(CacheKeys.companies.all);
        res.status(200).json({ company: updatedCompany });
    } catch (err) {
        logger.error(`❌ Error updating company: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await createCompanyService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    await createCompanyService.deleteCompany(id);
    await Cache.del(CacheKeys.companies.all);
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (err) {
    logger.error(`❌ Error deleting company: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};