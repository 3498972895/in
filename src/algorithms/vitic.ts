import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { randomBetween } from '../utils/generation.ts'
import { BidderId, Bidders, BidItems, BidResult, BidTransitions, OutsourcingResults } from '../type.d.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function vickrey(bidItems: BidItems, bidders: Bidders, allocatedTransmissionPower: number) {
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
						bidderCost: acceptableMinimumAuctionPriceFromBidder,
						transmissionEnergyCostToBidder,
						computationResourceRequirement,
						bidderId,
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
		const transitionCollection = bidTransitions[bidId].filter((bidTransition) =>
			!assignedBidders.has(bidTransition.bidderId)
		)

		if (transitionCollection.length !== 0) {
			const selectedBidderInfo = transitionCollection.reduce(
				(
					{
						minTotalCostBidderId,
						minTotalCost,
						secondMinTotalCost,
						allocatedComputationResource,
						bidderCost,
						transmissionCost,
						bid,
					},
					bidTransition,
				) => {
					const currentTotalCost = bidTransition.transmissionEnergyCostToBidder + bidTransition.bid
					if (currentTotalCost < minTotalCost) {
						secondMinTotalCost = minTotalCost
						minTotalCost = currentTotalCost
						minTotalCostBidderId = bidTransition.bidderId
						allocatedComputationResource = bidTransition.computationResourceRequirement
						bidderCost = bidTransition.bidderCost
						transmissionCost = bidTransition.transmissionEnergyCostToBidder
						bid = bidTransition.bid
					} else if (currentTotalCost < secondMinTotalCost || secondMinTotalCost === Infinity) {
						secondMinTotalCost = currentTotalCost
					}
					return {
						minTotalCostBidderId,
						minTotalCost,
						secondMinTotalCost,
						allocatedComputationResource,
						bidderCost,
						transmissionCost,
						bid,
					}
				},
				{
					minTotalCostBidderId: bidTransitions[bidId][0].bidderId,
					minTotalCost: bidTransitions[bidId][0].transmissionEnergyCostToBidder +
						bidTransitions[bidId][0].bid,
					secondMinTotalCost: Infinity,
					allocatedComputationResource: bidTransitions[bidId][0].computationResourceRequirement,
					bidderCost: bidTransitions[bidId][0].bidderCost,
					transmissionCost: bidTransitions[bidId][0].transmissionEnergyCostToBidder,
					bid: bidTransitions[bidId][0].bid,
				},
			)

			const payment = selectedBidderInfo.secondMinTotalCost - selectedBidderInfo.transmissionCost
			const taskServerCost = selectedBidderInfo.secondMinTotalCost
			serverCost += taskServerCost
			serverIncome += bidItems[bidId].nominalHighestBidPrice
			serverUtility += bidItems[bidId].nominalHighestBidPrice - taskServerCost

			const bidResult: BidResult = {
				bidId: bidId,
				bidWinnerId: selectedBidderInfo.minTotalCostBidderId,
				bidWinnerIncome: payment,
				bidWinnerCost: selectedBidderInfo.bidderCost,
				bidWinnerUtility: payment - selectedBidderInfo.bidderCost,
				allocatedComputationResource: selectedBidderInfo.allocatedComputationResource,
				taskCost: taskServerCost,
				executionDuration: computeTaskExecutionDuration(
					bidItems[bidId].dataSize,
					bidItems[bidId].complexity,
					selectedBidderInfo.allocatedComputationResource,
				),
				serverUtility: bidItems[bidId].nominalHighestBidPrice - taskServerCost,
			}

			assignedBidders.add(bidResult.bidWinnerId)
			outsourcingResults[bidItems[bidId].taskId] = {
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
export default vickrey
