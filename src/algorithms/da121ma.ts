import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { randomBetween } from '../utils/generation.ts'
import { Bidders, BidItems, BidResults, BidTransitions, TaskResDistro, TasksPaying, Time } from '../type.d.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function da121ma(bidItems: BidItems, bidders: Bidders, transmissionPower: number) {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	const bidTransitions: BidTransitions = {}
	const tasksPaying: TasksPaying = {}
	const taskResDistro: TaskResDistro = {}
	const transmissionDurationToWinnerBidders: { [taskId: string]: Time } = {}
	const bidResults: BidResults = {}

	for (const bidId in bidItems) {
		for (const bidderId in bidders) {
			const dataSize = bidItems[bidId].task.dataSize
			const complexity = bidItems[bidId].task.complexity
			const delayTolerance = bidItems[bidId].task.delayTolerance
			const transmissionDurationToServer = bidItems[bidId].transmissionDurationToServer
			const transmitionRate = bidders[bidderId].transmissionRate
			const transmissionDurationToBidder = computeTaskTransmissionDuration(dataSize, transmitionRate)
			const taskWillingToPaying = bidItems[bidId].taskWillingToPaying

			const transmissionEnergyCostToBidder = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskTransmissionEnergyConsumption(transmissionPower, transmissionDurationToBidder),
			)
			const acceptableMaximumAuctionPriceFromSeller = taskWillingToPaying - transmissionEnergyCostToBidder
			const computationResourceRequirement = computeMinimumComputationResource(
				dataSize,
				complexity,
				transmissionDurationToServer + transmissionEnergyCostToBidder,
				delayTolerance,
			)
			if (computationResourceRequirement <= bidders[bidderId].computationResource) {
				const acceptableMinimumAuctionPriceFromBidder = computeEnergyCost(
					ELECTRICITY_UNIT_PRICE,
					computeTaskExecutionEnergyConsumption(
						POWER_CONSUMPTION_FACTOR,
						computationResourceRequirement,
						dataSize,
						complexity,
					),
				)
				if (bidTransitions[bidId] == undefined) {
					bidTransitions[bidId] = []
				}
				bidTransitions[bidId] = [...bidTransitions[bidId], {
					acceptableMaximumAuctionPriceFromSeller,
					acceptableMinimumAuctionPriceFromBidder,
					transmissionDurationToBidder,
					computationResourceRequirement,
					bidderId,
					bid: acceptableMinimumAuctionPriceFromBidder <= acceptableMaximumAuctionPriceFromSeller
						? randomBetween(
							acceptableMinimumAuctionPriceFromBidder,
							acceptableMaximumAuctionPriceFromSeller,
						)
						: 0,
				}]
			}
		}
	}

	for (const bidId in bidItems) {
		const transition = bidTransitions[bidId]
		const [choosenBidderId, choosenBidUtilty] = transition.reduce(
			([choosenBidderId, choosenBidUtility], bidTransition) => {
				const currentBidUtility = bidTransition.acceptableMaximumAuctionPriceFromSeller - bidTransition.bid
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
		serverIncome += choosenTransition.acceptableMaximumAuctionPriceFromSeller
		serverUtility += choosenBidUtilty
		taskResDistro[bidItems[bidId].taskId] = choosenTransition.computationResourceRequirement
		tasksPaying[bidItems[bidId].taskId] = bidItems[bidId].taskWillingToPaying
		bidResults[choosenTransition.bidderId] = {
			bidId: bidId,
			winnerIncome: choosenTransition.bid,
			winnerCost: choosenTransition.acceptableMinimumAuctionPriceFromBidder,
			winnerUtility: choosenTransition.bid - choosenTransition.acceptableMinimumAuctionPriceFromBidder,
		}
		transmissionDurationToWinnerBidders[bidItems[bidId].taskId] = choosenTransition.transmissionDurationToBidder
	}

	return {
		serverCost,
		serverIncome,
		serverUtility,
		taskResDistro,
		tasksPaying,
		transmissionDurationToWinnerBidders,
		bidResults,
	}
}
export default da121ma
