type Resource = number
type Price = number
type Utility = number
type Time = number

export type ComplexNumber = {
	real: number
	imag: number
}
export type Task = {
	dataSize: number
	complexity: number
	delayTolerance: number
}
export type ExecutionLocation = 'local' | 'server' | 'assistor'

export type TaskRecording = {
	executionEnergyConsumptionOnLocal: number
	executionEnergyCostOnLocal: number
	executionDurationOnLocal: number

	transmissionDurationToServer: number
	transmissionEnergyConsumptionToServer: number
	transmissionEnergyCostOnServer: number

	allocatedComputationResource: number
	minimumComputationResource: number

	executionLocation: ExecutionLocation
	executionDuration: number
}

export type TaskResDistro = {
	[taskId: string]: Resource
}

export type TasksPaying = {
	[taskId: string]: Price
}
export type TasksExecutionDuration = {
	[taskId: string]: number
}

export type TaskRequest = {
	userId: string
	task: Task
	transmissionDurationToServer: number
	preferenceCoefficient: number
	minimumComputationResource: number
	maximumAcceptablePrice: number
	updateCallback: (data: TaskFeedback) => void
}

export type TaskRequests = {
	[taskId: string]: TaskRequest
}

export type TaskFeedback = {
	paying: number
	executionLocation: ExecutionLocation
	executionDuration: number
	allocatedComputationResource: number
	minimumComputationResource?: number
}

export type TaskFeedbacks = {
	[taskId: string]: TaskFeedback
}

export type BidderRequest = {
	assistor_id: string
	transmissionRate: number
	computationResource: number
	updateCallback: (data: BidResult) => void
}
export type Bidders = {
	[bidderId: string]: BidderRequest
}

export type BidItem = {
	taskId: string
	task: Task
	taskWillingToPaying: number
	transmitonDurationToServer: number
}
export type BidItems = {
	[bidId: string]: BidItem
}

export type BidTransition = {
	acceptableMinimumAuctionPriceFromSeller: number
	acceptableMinimumAuctionPriceFromBidder: number
	computationResourceRequirement: number
	bidderId: string
	bid: number
}
export type BidTransitions = {
	[bidId: string]: BidTransition[]
}

export type BidResult = {
	bidId: string
	winnerIncome: number
	winnerCost: number
	winnerUtility: number
}
export type BidResults = {
	[winnerBidderId: string]: BidResult
}
