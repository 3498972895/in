import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { randomBetween } from '../utils/generation.ts'
import { BidderId, Bidders, BidItems, BidResult, BidTransitions, OutsourcingResults, StageIIResult } from '../type.d.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function da121ma(bidItems: BidItems, bidders: Bidders, allocatedTransmissionPower: number): StageIIResult {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	const bidTransitions: BidTransitions = {}
	const outsourcingResults: OutsourcingResults = {}
	const assignedBidders = new Set<BidderId>()

	for (const bidId in bidItems) {
		bidTransitions[bidId] = []
		for (const bidderId in bidders) {
			const dataSize = bidItems[bidId].dataSize
			const complexity = bidItems[bidId].complexity
			const allowedTime = bidItems[bidId].allowedTime
			const transmitionRate = bidders[bidderId].transmissionRate
			const transmissionDurationToBidder = computeTaskTransmissionDuration(dataSize, transmitionRate)
			const nominalHighestBidPrice = bidItems[bidId].nominalHighestBidPrice
			const transmissionEnergyCostToBidder = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskTransmissionEnergyConsumption(allocatedTransmissionPower, transmissionDurationToBidder),
			)
			const acceptableMaximumAuctionPriceFromSeller = nominalHighestBidPrice - transmissionEnergyCostToBidder
			const computationResourceRequirement = computeMinimumComputationResource(
				dataSize,
				complexity,
				transmissionDurationToBidder,
				allowedTime,
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

				if (acceptableMinimumAuctionPriceFromBidder <= acceptableMaximumAuctionPriceFromSeller) {
					bidTransitions[bidId] = [...bidTransitions[bidId], {
						bidderId,
						bidderCost: acceptableMinimumAuctionPriceFromBidder,
						computationResourceRequirement,
						transmissionEnergyCostToBidder,
						bid: randomBetween(
							true,
							acceptableMinimumAuctionPriceFromBidder,
							acceptableMaximumAuctionPriceFromSeller,
						),
					}]
				}
			}
		}
	}

	for (const bidId in bidItems) {
		const taskId = bidItems[bidId].taskId
		const dataSize = bidItems[bidId].dataSize
		const complexity = bidItems[bidId].complexity
		const transitionCollection = bidTransitions[bidId].filter((bidTransition) =>
			!assignedBidders.has(bidTransition.bidderId)
		)

		if (transitionCollection.length !== 0) {
			const selectedBidderInfo = transitionCollection.reduce(
				(acc, bidTransition) => {
					const currentTotalCost = bidTransition.bid + bidTransition.transmissionEnergyCostToBidder

					if (currentTotalCost < acc.minTotalCost) {
						return {
							minTotalCostBidderId: bidTransition.bidderId,
							bidderCost: bidTransition.bidderCost,
							bid: bidTransition.bid,
							allocatedComputationResource: bidTransition.computationResourceRequirement,
							transmissionCost: bidTransition.transmissionEnergyCostToBidder,
							minTotalCost: currentTotalCost,
						}
					}
					return acc
				},
				{
					minTotalCostBidderId: transitionCollection[0].bidderId,
					bidderCost: transitionCollection[0].bidderCost,
					bid: transitionCollection[0].bid,
					allocatedComputationResource: transitionCollection[0].computationResourceRequirement,
					transmissionCost: transitionCollection[0].transmissionEnergyCostToBidder,
					minTotalCost: transitionCollection[0].bid + transitionCollection[0].transmissionEnergyCostToBidder,
				},
			)

			const payment = selectedBidderInfo.bid
			const taskServerCost = selectedBidderInfo.minTotalCost
			const taskServerUtility = bidItems[bidId].nominalHighestBidPrice - taskServerCost

			serverCost += taskServerCost
			serverIncome += bidItems[bidId].nominalHighestBidPrice
			serverUtility += taskServerUtility

			const bidResult: BidResult = {
				bidId: bidId,
				bidWinnerId: selectedBidderInfo.minTotalCostBidderId,
				bidWinnerIncome: payment,
				bidWinnerCost: selectedBidderInfo.bidderCost,
				bidWinnerUtility: payment - selectedBidderInfo.bidderCost,
				allocatedComputationResource: selectedBidderInfo.allocatedComputationResource,
				taskCost: selectedBidderInfo.transmissionCost + selectedBidderInfo.bid,
				executionDuration: computeTaskExecutionDuration(
					dataSize,
					complexity,
					selectedBidderInfo.allocatedComputationResource,
				),
				serverUtility: bidItems[bidId].nominalHighestBidPrice -
					(selectedBidderInfo.transmissionCost + selectedBidderInfo.bid),
			}

			assignedBidders.add(bidResult.bidWinnerId)
			outsourcingResults[taskId] = {
				outsourcingId: bidResult.bidId,
				choosenParticipantId: bidResult.bidWinnerId,
				choosenParticipantIncome: bidResult.bidWinnerIncome,
				choosenParticipantCost: bidResult.bidWinnerCost,
				choosenParticipantUtility: bidResult.bidWinnerUtility,
				allocatedComputationResource: bidResult.allocatedComputationResource,
				taskCost: bidResult.taskCost,
				executionDuration: bidResult.executionDuration,
				serverUtility: bidResult.serverUtility,
			}
		}
	}
	return {
		serverCost,
		serverIncome,
		serverUtility,
		outsourcingResults,
	}
}
export default da121ma
