const DbHelper = require("./DbHelper.js");
const SKU = require("./SKU.js");
const TestDescriptor = require("./TestDescriptor.js");
const Position = require("./Position.js");
const EzWhException = require("./EzWhException.js");
const SKUItem = require("./SKUItem");

class EzWhFacade {
	constructor() {
		this.db = new DbHelper("./dev.db");
		this.db.createTables();
	}

	async getSKUs() {
		try {
			let skusJson = await this.db.getSKUs();
			let skus = skusJson.map((s) => new SKU(s["SKUID"], s["Description"], s["Weight"], s["Volume"], s["Notes"], s["Price"], s["AvailableQuantity"], s["Position"]));
			for (let s of skus) {
				let testDescriptorsJson = await this.db.getTestDescriptorsBySKUID(s.id);
				testDescriptorsJson.forEach((t) => s.addTestDescriptor(new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])));
				// TODO: Uncomment when position ready
				// let positionJson = await this.db.getPositionById(s.position);
				// s.position = new Position(positionJson["PositionID"], positionJson["AisleID"], positionJson["Row"], positionJson["Col"], positionJson["MaxWeight"], positionJson["MaxVolume"], positionJson["OccupiedWeight"], positionJson["OccupiedVolume"], positionJson["SKUID"]);
			}
			return skus;
		} catch (err) {
			throw EzWhException.InternalError;
		}
	}

	async createSKU(description, weight, volume, notes, price, availableQuantity) {
		try {
			return await this.db.createSKU(description, weight, volume, notes, price, availableQuantity);
		} catch (err) {
			throw EzWhException.InternalError;
		}
	}

	async getSKUById(id) {
		try {
			let skuJson = await this.db.getSKUById(id);
			if (skuJson === undefined) {
				throw EzWhException.NotFound;
			}
			let sku = new SKU(skuJson["SKUID"], skuJson["Description"], skuJson["Weight"], skuJson["Volume"], skuJson["Notes"], skuJson["Price"], skuJson["AvailableQuantity"], skuJson["Position"]);
			let testDescriptorsJson = await this.db.getTestDescriptorsBySKUID(sku.id);
			testDescriptorsJson.forEach((t) => sku.addTestDescriptor(new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])));
			// TODO: Uncomment when position ready
			// let positionJson = await this.db.getPositionById(s.position);
			// sku.position = new Position(positionJson["PositionID"], positionJson["AisleID"], positionJson["Row"], positionJson["Col"], positionJson["MaxWeight"], positionJson["MaxVolume"], positionJson["OccupiedWeight"], positionJson["OccupiedVolume"], positionJson["SKUID"]);
			return sku;
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else
				throw EzWhException.InternalError;
		}
	}

	async modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
		try {
			let sku = await this.getSKUById(id);
			if (sku.position && (sku.position.maxWeight < newWeight * newAvailableQuantity || sku.position.maxVolume < newVolume * newAvailableQuantity))
				throw EzWhException.PositionFull;
			await this.db.modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);
			if (sku.position)
				await this.modifyPosition(sku.position.positionId, sku.position.aisleId, sku.position.row, sku.position.col, sku.position.maxWeight, sku.position.maxVolume, newWeight * newAvailableQuantity, newVolume * newAvailableQuantity);
		} catch (err) {
			if (err === EzWhException.PositionFull)
				throw EzWhException.PositionFull;
			else
				throw EzWhException.InternalError;
		}
	}

	async addSKUPosition(id, positionId) {
		try {
			let sku = await this.getSKUById(id);
			let position = await this.getPositionById(positionId);
			if (position.maxWeight < sku.weight * sku.availableQuantity || position.maxVolume < sku.volume * sku.availableQuantity)
				throw EzWhException.PositionFull
			await this.db.addSKUPosition(id, positionId);
			await this.modifyPosition(position.positionId, position.aisleId, position.row, position.col, position.maxWeight, position.maxVolume, sku.weight * sku.availableQuantity, sku.volume * sku.availableQuantity);
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else if (err === EzWhException.PositionFull)
				throw EzWhException.PositionFull;
			else
				throw EzWhException.InternalError;
		}
	}

	async deleteSKU(id) {
		try {
			return await this.db.deleteSKU(id);
		} catch (err) {
			throw EzWhException.InternalError;
		}
	}

	async getSKUItems() {
		try {
			let skuItemsJson = await this.db.getSKUItems();
			let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
			for (let s of skuItems) {
				s.sku = await this.getSKUById(s.sku);
				//TODO: add testResults if needed
			}
			return skuItems;
		} catch (err) {
			throw EzWhException.InternalError;
		}
	}

	async getSKUItemsBySKU(SKUID) {
		try {
			let sku = await this.getSKUById(SKUID);
			let skuItemsJson = await this.db.getSKUItemsBySKU(SKUID);
			let skuItems = skuItemsJson.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock));
			for (let s of skuItems) {
				s.sku = await this.getSKUById(s.sku);
				//TODO: add testResults if needed
			}
			return skuItems;
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else
				throw EzWhException.InternalError;
		}
	}

	async getSKUItemByRfid(rfid) {
		try {
			let skuItemJson = await this.db.getSKUItemByRfid(rfid);
			if (skuItemJson === undefined)
				throw EzWhException.NotFound;
			let skuItem = new SKUItem(skuItemJson.RFID, skuItemJson.SKUID, skuItemJson.Available, skuItemJson.DateOfStock);
			skuItem.sku = await this.getSKUById(skuItem.sku);
			//TODO: add testResults if needed
			return skuItem;
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else
				throw EzWhException.InternalError;
		}
	}

	async deleteSKUItem(rfid) {
		try {
			return await this.db.deleteSKUItem(rfid);
		} catch (err) {
			throw EzWhException.InternalError;
		}
	}

	async modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock) {
		try {
			let skuItem = await this.getSKUItemByRfid(rfid);
			await this.db.modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock);
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else
				throw EzWhException.InternalError;
		}
	}

	async createSKUItem(rfid, SKUId, dateOfStock) {
		try {
			let sku = await this.getSKUById(SKUId);
			await this.db.createSKUItem(rfid, SKUId, dateOfStock);
		} catch (err) {
			if (err === EzWhException.NotFound)
				throw EzWhException.NotFound;
			else if (err.code === 'SQLITE_CONSTRAINT' && err.errno === 19) { // If there is already a skuitem with the same rfid
				throw EzWhException.InternalError;
			}
			else
				throw EzWhException.InternalError;
		}
	}
}

module.exports = EzWhFacade;
