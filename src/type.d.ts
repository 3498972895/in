export type Resource = number
export type Price = number
export type Utility = number
export type Time = number
type VehicleType = 'task' | 'assistor'

export type AlgorithmResult = {
	serverCost: Price
	serverIncome: Price
	serverUtility: Price
	usedComputationResource: Price
	avergeUnitResourcePrice: Price
	taskResults: { [taskId: string]: TaskResult }
}
export type ComplexNumber = {
	real: number
	imag: number
}
export type Task = {
	dataSize: number
	complexity: number
	delayTolerance: number
	value: number
	decayFactor: number
}

type CommunicationVehicle = {
	computationResource?: number
	transmissionPower: number
	transmissionRate: number
}

export type ExecutionLocation = 'noWhere' | 'server' | 'assistor'

export type TasksPaying = {
	[taskId: string]: Price
}

export type TaskRequest = {
	userId: string
	task: Task
	transmissionRate: number
	updateCallback: (data: TaskFeedback) => void
}
export type TaskFeedback = {
	utility: number
	paying: number
}
export type TaskFeedbacks = {
	[taskId: string]: TaskFeedback
}

export type TaskRequests = {
	[taskId: string]: TaskRequest
}

export type PayingResult = {
	paying: Price
	executionLocation: ExecutionLocation
	allocatedComputationResource: Resource
	executionDuration: Time
	taskCost: Price
	transmissionDurationToServer: Time
	transmissionDurationToAssistor: Time
	utilityFromUser: Utility
	utilityFromServer: Utility
}
export type NotPayingResult = { willingToPay: Price }
export type TaskResult = PayingResult | NotPayingResult
export type TaskResults = {
	[taskId: string]: TaskResult
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
	transmissionDurationToServer: number
}
export type BidItems = {
	[bidId: string]: BidItem
}

export type BidTransition = {
	acceptableMaximumAuctionPriceFromSeller: number
	acceptableMinimumAuctionPriceFromBidder: number
	computationResourceRequirement: number
	transmissionDurationToBidder: number
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
