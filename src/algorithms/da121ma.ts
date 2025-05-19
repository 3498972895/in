import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { Bidders, BidItems, BidResults, BidTransitions, TaskResDistro, TasksPaying } from '../type.d.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function da121ma(bidItems: BidItems, bidders: Bidders, transmitionPower: number) {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0

	const bidTransitions: BidTransitions = {}
	const tasksPaying: TasksPaying = {}
	const taskResDistro: TaskResDistro = {}
	const bidResults: BidResults = {}

	for (const bidId in bidItems) {
		for (const bidderId in bidders) {
			const dataSize = bidItems[bidId].task.dataSize
			const complexity = bidItems[bidId].task.complexity
			const delayTolerance = bidItems[bidId].task.delayTolerance
			const transmitonDurationToServer = bidItems[bidId].transmitonDurationToServer
			const transmitionRate = bidders[bidderId].transmissionRate
			const transmitonDurationToBidder = computeTaskTransmissionDuration(dataSize, transmitionRate)
			const taskWillingToPaying = bidItems[bidId].taskWillingToPaying

			const transmitonEnergyCostToBidder = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskTransmissionEnergyConsumption(transmitionPower, transmitonDurationToBidder),
			)
			const acceptableMinimumAuctionPriceFromSeller = taskWillingToPaying - transmitonEnergyCostToBidder
			const taskComputationResourceRequirement = computeMinimumComputationResource(
				dataSize,
				complexity,
				transmitonDurationToServer + transmitonEnergyCostToBidder,
				delayTolerance,
			)
			if (taskComputationResourceRequirement <= bidders[bidderId].computationResource) {
				const acceptableMinimumAuctionPriceFromBidder = computeEnergyCost(
					ELECTRICITY_UNIT_PRICE,
					computeTaskExecutionEnergyConsumption(
						POWER_CONSUMPTION_FACTOR,
						taskComputationResourceRequirement,
						dataSize,
						complexity,
					),
				)
				bidTransitions[bidId].push({
					acceptableMinimumAuctionPriceFromSeller,
					acceptableMinimumAuctionPriceFromBidder,
					computationResourceRequirement: taskComputationResourceRequirement,
					bidderId,
					bid: acceptableMinimumAuctionPriceFromBidder <= acceptableMinimumAuctionPriceFromSeller
						? Math.random() *
							(acceptableMinimumAuctionPriceFromSeller - acceptableMinimumAuctionPriceFromBidder + 1) *
							acceptableMinimumAuctionPriceFromBidder
						: 0,
				})
			}
		}
	}

	for (const bidId in bidItems) {
		const [choosenBidderId, choosenBidUtilty] = bidTransitions[bidId].reduce<[string, number]>(
			([choosenBidderId, choosenBidUtility], bidTransition) => {
				const currentBidUtility = bidTransition.acceptableMinimumAuctionPriceFromSeller - bidTransition.bid
				return currentBidUtility > choosenBidUtility
					? [bidTransition.bidderId, currentBidUtility]
					: [choosenBidderId, choosenBidUtility]
			},
			['', 0],
		)
		const choosenTransition = bidTransitions[bidId].filter((bidTransition) =>
			bidTransition.bidderId == choosenBidderId
		)[0]
		serverCost += choosenTransition.bid
		serverIncome += choosenTransition.acceptableMinimumAuctionPriceFromSeller
		serverUtility += choosenBidUtilty
		taskResDistro[bidItems[bidId].taskId] = choosenTransition.computationResourceRequirement
		tasksPaying[bidItems[bidId].taskId] = bidItems[bidId].taskWillingToPaying
		bidResults[choosenTransition.bidderId] = {
			bidId: bidId,
			winnerIncome: choosenTransition.bid,
			winnerCost: choosenTransition.acceptableMinimumAuctionPriceFromBidder,
			winnerUtility: choosenTransition.bid - choosenTransition.acceptableMinimumAuctionPriceFromBidder,
		}
	}

	return { serverCost, serverIncome, serverUtility, taskResDistro, tasksPaying, bidResults }
}
export default da121ma
