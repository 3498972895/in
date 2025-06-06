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

function vickrey(bidItems: BidItems, bidders: Bidders, transmissionPower: number) {
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
				bidTransitions[bidId].push({
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
				})
			}
		}
	}

	for (const bidId in bidItems) {
		const result = bidTransitions[bidId].reduce(
			(
				{
					maxBidderId,
					maxBidderCost,
					maxBid,
					maxUtility,
					secondUtility,
					secondBid,
					bidIncome,
					transmissionDuration,
				},
				bidTransition,
			) => {
				const currentUtility = bidTransition.acceptableMaximumAuctionPriceFromSeller - bidTransition.bid
				const currentBidderId = bidTransition.bidderId
				const currentBid = bidTransition.bid
				const currentBidderCost = bidTransition.acceptableMinimumAuctionPriceFromBidder
				const currentServerIncome = bidTransition.acceptableMaximumAuctionPriceFromSeller
				const currentTransmissionDuration = bidTransition.transmissionDurationToBidder
				if (currentUtility > maxUtility) {
					secondUtility = maxUtility
					secondBid = maxBid
					maxUtility = currentUtility
					maxBidderId = currentBidderId
					maxBid = currentBid
					maxBidderCost = currentBidderCost
					bidIncome = currentServerIncome
					transmissionDuration = currentTransmissionDuration
				} else if (secondUtility < currentUtility && currentUtility < maxUtility) {
					secondUtility = currentUtility
					secondBid = currentBid
				}
				return {
					maxBidderId,
					maxBidderCost,
					maxBid,
					maxUtility,
					secondUtility,
					secondBid,
					bidIncome,
					transmissionDuration,
				}
			},
			{
				maxBidderId: '',
				maxBidderCost: Infinity,
				maxBid: -Infinity,
				maxUtility: -Infinity,
				secondUtility: -Infinity,
				secondBid: -Infinity,
				bidIncome: -Infinity,
				transmissionDuration: -Infinity,
			},
		)
		serverCost += result.secondBid
		serverIncome += result.bidIncome
		serverUtility += result.bidIncome - result.secondBid
		bidResults[result.maxBidderId] = {
			bidId: bidId,
			winnerIncome: result.secondBid,
			winnerCost: result.maxBidderCost,
			winnerUtility: result.secondBid - result.maxBidderCost,
		}

		transmissionDurationToWinnerBidders[bidItems[bidId].taskId] = result.transmissionDuration
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
export default vickrey
