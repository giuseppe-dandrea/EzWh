const dao = require("../database/SKU_dao");
const SKU = require("../modules/SKU");
const TestDescriptor = require("../modules/TestDescriptor");
const EzWhException = require("./src/EzWhException.js");

class SKUService {
    constructor() {
    }

    async getSKUs() {
        try {
            let skusJson = await dao.getSKUs();
            let skus = skusJson.map(
                (s) =>
                    new SKU(
                        s["SKUID"],
                        s["Description"],
                        s["Weight"],
                        s["Volume"],
                        s["Notes"],
                        s["Price"],
                        s["AvailableQuantity"],
                        s["Position"]
                    )
            );
            for (let s of skus) {
                let testDescriptorsJson = await dao.getTestDescriptorsBySKUID(s.id);
                testDescriptorsJson.forEach((t) =>
                    s.addTestDescriptor(
                        new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])
                    )
                );
                if (s.position)
                    s.position = await this.getPositionByID(s.position);
            }
            return skus;
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async createSKU(description, weight, volume, notes, price, availableQuantity) {
        try {
            return await dao.createSKU(description, weight, volume, notes, price, availableQuantity);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getSKUById(id) {
        try {
            let skuJson = await dao.getSKUById(id);
            if (skuJson === undefined) {
                throw EzWhException.NotFound;
            }
            let sku = new SKU(
                skuJson["SKUID"],
                skuJson["Description"],
                skuJson["Weight"],
                skuJson["Volume"],
                skuJson["Notes"],
                skuJson["Price"],
                skuJson["AvailableQuantity"],
                skuJson["Position"]
            );
            let testDescriptorsJson = await dao.getTestDescriptorsBySKUID(sku.id);
            testDescriptorsJson.forEach((t) =>
                sku.addTestDescriptor(
                    new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])
                )
            );
            if (sku.position)
                sku.position = await this.getPositionByID(sku.position);
            return sku;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
        try {
            let sku = await this.getSKUById(id);
            if (
                sku.position &&
                (sku.position.maxWeight < newWeight * newAvailableQuantity ||
                    sku.position.maxVolume < newVolume * newAvailableQuantity)
            )
                throw EzWhException.PositionFull;
            if (sku.position)
                await this.modifySKUPosition(
                    sku.position.positionID,
                    newWeight * newAvailableQuantity,
                    newVolume * newAvailableQuantity,
                    id
                );
            await dao.modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);
        } catch (err) {
            if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
            else if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId) {
        try {
            await this.getPositionByID(positionId);
            return await dao.modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
            else throw EzWhException.InternalError;
        }
    }

    async addSKUPosition(id, positionId) {
        try {
            let sku = await this.getSKUById(id);
            let position = await this.getPositionByID(positionId);
            if (
                position.maxWeight < sku.weight * sku.availableQuantity ||
                position.maxVolume < sku.volume * sku.availableQuantity
            )
                throw EzWhException.PositionFull;
            if (position.sku !== null) throw EzWhException.PositionFull;
            await dao.modifySKUPosition(
                positionId,
                sku.weight * sku.availableQuantity,
                sku.volume * sku.availableQuantity,
                id
            );
            await dao.addSKUPosition(id, positionId);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
            else throw EzWhException.InternalError;
        }
    }

    async deleteSKU(id) {
        try {
            return await dao.deleteSKU(id);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }
}

module.exports = SKUService;
