export function computeTaskExecutionDuration(
	dataSize: number,
	complexity: number,
	computationResource: number,
): number {
	return (dataSize * complexity) / computationResource
}

export function computeTaskExecutionEnergyConsumption(
	powerConsumptionFactor: number,
	computationResource: number,
	dataSize: number,
	complexity: number,
): number {
	return (
		powerConsumptionFactor *
		Math.pow(computationResource, 2) *
		dataSize *
		complexity
	)
}

export function computeEnergyCost(
	electricityUnitPrice: number,
	energyConsumption: number,
): number {
	return electricityUnitPrice * energyConsumption
}

export function computeMinimumComputationResource(
	dataSize: number,
	complexity: number,
	timeElapsed: number,
	delayTolerance: number,
): number {
	return (dataSize * complexity) /
		computeTaskMaxExecutionTime(delayTolerance, timeElapsed)
}

export function computeTaskTransmissionDuration(
	dataSize: number,
	transmissionRate: number,
): number {
	return dataSize / transmissionRate
}

export function computeTaskMaxExecutionTime(
	delayTolerance: number,
	timeUsed: number,
): number {
	return delayTolerance - timeUsed
}

export function computeTaskTransmissionEnergyConsumption(
	transmissionPower: number,
	transmissionDuration: number,
): number {
	return transmissionPower * transmissionDuration
}

export function computeTotalCost(
	energyCost: number,
	pay: number,
): number {
	return energyCost + pay
}

export function computePreferenceCoefficient(
	costWeight: number,
	timeWeight: number,
	executionDuration: number,
	executionEnergyCost: number,
): number {
	return (costWeight / timeWeight) * (executionDuration / executionEnergyCost)
}

export function computeUserUtility(
	preferenceCoefficient: number,
	moneyCost: number,
	timeCost: number,
): number {
	return preferenceCoefficient * moneyCost + timeCost
}

export function computeUserUtilityX0(
	preferenceCoefficient: number,
	executionEnergyCost: number,
	executionDuration: number,
): number {
	return computeUserUtility(
		preferenceCoefficient,
		executionEnergyCost,
		executionDuration,
	)
}

export function computeUserUtilityX1(
	transmissionCost: number,
	paying: number,
	transmissionDuration: number,
	executionDuration: number,
	preferenceCoefficient: number,
): number {
	const M = transmissionCost + paying
	const t = transmissionDuration + executionDuration
	return computeUserUtility(preferenceCoefficient, M, t)
}

export function computeMaximumAcceptablePrice(
	utilityX0: number,
	transmissionEnergyCost: number,
	delayTolerance: number,
	preferenceCoefficient: number,
	minimumComputationResource: number,
): number {
	return (
		utilityX0 -
		transmissionEnergyCost -
		(delayTolerance / preferenceCoefficient) * minimumComputationResource
	)
}

// ServerCalculator 部分
export function computeServerUtility(
	sumP: number,
	sumEnergyCostFromExecution: number,
	sumEnergyCostFromTransmission: number,
	sumOutsourcingCost: number,
): number {
	return (
		sumP -
		sumEnergyCostFromExecution -
		sumEnergyCostFromTransmission -
		sumOutsourcingCost
	)
}

export function computeServerUtilityCompact(
	sumIncome: number,
	sumCost: number,
): number {
	return computeServerUtility(sumIncome, sumCost, 0, 0)
}

export function computeSwitchPrice(
	dataSize: number,
	complexity: number,
	preferenceCoefficient: number,
	minimumComputationResource: number,
): number {
	return (
		(dataSize * complexity) /
		(preferenceCoefficient * Math.pow(minimumComputationResource, 2))
	)
}

export function hasEnoughComputationResource(
	computationResource: number,
	computationResourceRequirement: number,
): boolean {
	return computationResource > computationResourceRequirement
}
