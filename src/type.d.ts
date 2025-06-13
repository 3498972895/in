export type ComplexNumber = {
	real: number
	imag: number
}

export type Resource = number
export type Price = number
export type Utility = number
export type Time = number
export type BidderId = string
export type ParticipantId = string

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

type VehicleType = 'task' | 'assistor'

export type StageIResult = {
	serverCost: Price
	serverIncome: Price
	serverUtility: Price
	usedComputationResource: Price
	avergeUnitResourcePrice: Price
	taskResults: { [taskId: string]: TaskResult }
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
	taskDuration: Time
	utilityFromUser: Utility
	utilityFromServer: Utility
}
export type NotPayingResult = {
	willingToPay: Price
	allowedTime: Time
	taskDuration: Time
	utilityFromUser: Utility
}
export type TaskResults = {
	[taskId: string]: TaskResult
}

export type TaskResult = PayingResult | NotPayingResult

export type StageIIResult = {
	serverCost: Price
	serverIncome: Price
	serverUtility: Utility
	outsourcingResults: OutsourcingResults
}

export type AssistorRequest = {
	assistorId: string
	transmissionRate: number
	computationResource: number
	updateCallback: (data: OutsourcingFeedback) => void
}

export type Participants = { [participantId: string]: AssistorRequest }

export type Bidders = { [bidderId: string]: AssistorRequest }

export type OutsourcingTask = {
	taskId: string
	dataSize: number
	complexity: number
	allowedTime: number
	nominalHighestBidPrice: Price
}

export type BidItem = OutsourcingTask

export type OutsourcingTasks = {
	[outsourcingId: string]: OutsourcingTask
}

export type BidItems = {
	[bidId: string]: BidItem
}

export type BidTransition = {
	bidderId: string
	bidderCost: number
	computationResourceRequirement: number
	transmissionEnergyCostToBidder: number
	bid: number
}
export type BidTransitions = {
	[bidId: string]: BidTransition[]
}

export type BidResult = {
	bidId: string
	bidWinnerId: string
	bidWinnerIncome: number
	bidWinnerCost: number
	bidWinnerUtility: number
	allocatedComputationResource: number
	taskCost: Price
	executionDuration: Time
	serverUtility: Price
}

export type OutsourcingResult = {
	outsourcingId: string
	choosenParticipantId: string
	choosenParticipantIncome: number
	choosenParticipantCost: number
	choosenParticipantUtility: number
	allocatedComputationResource: number
	taskCost: Price
	executionDuration: Time
	serverUtility: Price
}

export type OutsourcingResults = {
	[taskId: string]: OutsourcingResult
}

export type OutsourcingFeedback = {
	outsourcingId: string
	income: number
	cost: number
	utility: number
}
