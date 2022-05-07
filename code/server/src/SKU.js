import { Position } from './Position'
class SKU {
	constructor(id, description, weight, volume, notes, price, availableQuantity, position = undefined, testDescriptors = undefined) {
		this.id = id;
		this.description = description;
		this.weight = weight;
		this.volume = volume;
		this.notes = notes;
		this.price = price;
		this.availableQuantity = availableQuantity;
		this.position = position;
		if (testDescriptors === undefined) {
			this.initTestDescriptors();
		} else {
			this.testDescriptors = testDescriptors;
		}
	}

	initTestDescriptors() {
		this.testDescriptors = [];
	}

	addTestDescriptor(testDescriptor) {
		this.testDescriptors.append(testDescriptor);
	}
}

module.exports = SKU;
