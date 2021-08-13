import { Collapse } from 'antd'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import { ThemeContext } from 'contexts/themeContext'
import { FundingCycle } from 'models/funding-cycle'
import { useContext } from 'react'
import { formatDate } from 'utils/formatDate'
import { detailedTimeString } from 'utils/formatTime'
import { hasFundingTarget, isRecurring } from 'utils/fundingCycle'

import FundingCycleDetails from './FundingCycleDetails'

export default function FundingCyclePreview({
  fundingCycle,
  showDetail,
}: {
  fundingCycle: FundingCycle | undefined
  showDetail?: boolean
}) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  if (!fundingCycle) return null

  const secsPerDay = 60 * 60 * 24

  const today = Math.floor(new Date().valueOf() / 1000 / secsPerDay)
  const daysLeft = fundingCycle.start
    .div(secsPerDay)
    .add(fundingCycle.duration)
    .sub(today)
  const endTime = fundingCycle.start
    .add(fundingCycle.duration.mul(secsPerDay))
    .mul(1000)
  const isEnded = daysLeft.lte(0)

  let headerText = ''

  const formattedEndTime = formatDate(
    fundingCycle.start.add(fundingCycle.duration.mul(secsPerDay)).mul(1000),
  )

  if (hasFundingTarget(fundingCycle)) {
    if (isRecurring(fundingCycle) && fundingCycle.duration.gt(0)) {
      headerText = isEnded
        ? `#${fundingCycle.number.add(1).toString()} starts ${formattedEndTime}`
        : `${detailedTimeString(endTime)} until #${fundingCycle.number
            .add(1)
            .toString()}`
    } else if (fundingCycle.duration.gt(0))
      headerText = detailedTimeString(endTime) + ' left'
  }

  return (
    <div>
      <Collapse
        style={{
          background: 'transparent',
          border: 'none',
        }}
        className="minimal"
        defaultActiveKey={showDetail ? '0' : undefined}
      >
        <CollapsePanel
          key={'0'}
          style={{ border: 'none' }}
          header={
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              {hasFundingTarget(fundingCycle) && fundingCycle.duration.gt(0) ? (
                <span>Cycle #{fundingCycle.number.toString()}</span>
              ) : (
                <span>Details</span>
              )}
              <span style={{ color: colors.text.secondary }}>{headerText}</span>
            </div>
          }
        >
          <FundingCycleDetails fundingCycle={fundingCycle} />
        </CollapsePanel>
      </Collapse>
    </div>
  )
}
