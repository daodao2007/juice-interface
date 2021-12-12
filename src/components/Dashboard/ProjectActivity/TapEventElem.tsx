import CurrencySymbol from 'components/shared/CurrencySymbol'
import EtherscanLink from 'components/shared/EtherscanLink'
import FormattedAddress from 'components/shared/FormattedAddress'
import ProjectHandle from 'components/shared/ProjectHandle'
import { ThemeContext } from 'contexts/themeContext'
import useSubgraphQuery from 'hooks/SubgraphQuery'
import { parseDistributeToPayoutModEvent } from 'models/subgraph-entities/distribute-to-payout-mod-event copy'
import { TapEvent } from 'models/subgraph-entities/tap-event'
import { useContext, useEffect } from 'react'
import { formatHistoricalDate } from 'utils/formatDate'
import { formatWad } from 'utils/formatNumber'
import { querySubgraph } from 'utils/graph'

import { smallHeaderStyle } from '../styles'

export default function TapEventElem({
  tapEvent,
}: {
  tapEvent: TapEvent | undefined
}) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const { data: payoutEvents } = useSubgraphQuery({
    entity: 'distributeToPayoutModEvent',
    keys: [
      'timestamp',
      'txHash',
      'modProjectId',
      'modBeneficiary',
      'modPercent',
      'modCut',
    ],
    orderDirection: 'desc',
    orderBy: 'modCut',
    where: {
      key: 'tapEvent',
      value: tapEvent?.id ?? '',
    },
  })

  useEffect(() => {
    querySubgraph(
      {
        entity: 'distributeToPayoutModEvent',
        keys: [
          'timestamp',
          'txHash',
          'modProjectId',
          'modBeneficiary',
          'modCut',
        ],
        orderDirection: 'desc',
        orderBy: 'modCut',
        where: tapEvent?.id
          ? {
              key: 'tapEvent',
              value: tapEvent.id,
            }
          : undefined,
      },
      res => {
        if (!res) return

        console.log(
          'TEST distributeToPayoutModEvents query:',
          res.distributeToPayoutModEvents.map(e =>
            parseDistributeToPayoutModEvent(e),
          ),
        )
      },
    )
  }, [tapEvent])

  if (!tapEvent) return null

  return (
    <div
      style={{
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid ' + colors.stroke.tertiary,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={smallHeaderStyle(colors)}>Withdrawn</div>

        <div
          style={{
            textAlign: 'right',
          }}
        >
          <div style={smallHeaderStyle(colors)}>
            {tapEvent.timestamp && (
              <span>{formatHistoricalDate(tapEvent.timestamp * 1000)}</span>
            )}{' '}
            <EtherscanLink value={tapEvent.txHash} type="tx" />
          </div>
          <div style={smallHeaderStyle(colors)}>
            called by <FormattedAddress address={tapEvent.caller} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 5 }}>
        {payoutEvents?.map(e => (
          <div
            key={
              e.modBeneficiary +
              (e.modProjectId?.toString() ?? '') +
              (e.modPercent?.toString() ?? '')
            }
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 500 }}>
              {e.modProjectId?.gt(0) ? (
                <span>
                  <ProjectHandle link projectId={e.modProjectId} />
                </span>
              ) : (
                <FormattedAddress address={e.modBeneficiary} />
              )}
              :
            </div>

            <div style={{ color: colors.text.secondary }}>
              <CurrencySymbol currency={0} />
              {formatWad(e.modCut, { decimals: 4 })}
            </div>
          </div>
        ))}

        {tapEvent.beneficiaryTransferAmount?.gt(0) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize:
                payoutEvents?.length && payoutEvents.length > 1
                  ? '0.8rem'
                  : undefined,
            }}
          >
            <div style={{ fontWeight: 500 }}>
              <FormattedAddress address={tapEvent.beneficiary} />:
            </div>
            <div
              style={
                payoutEvents?.length && payoutEvents.length > 1
                  ? { color: colors.text.secondary }
                  : { fontWeight: 500 }
              }
            >
              <CurrencySymbol currency={0} />
              {formatWad(tapEvent.beneficiaryTransferAmount, { decimals: 4 })}
            </div>
          </div>
        )}
      </div>

      {payoutEvents?.length && payoutEvents.length > 1 ? (
        <div
          style={{
            color: colors.text.primary,
            fontWeight: 500,
            textAlign: 'right',
          }}
        >
          <CurrencySymbol currency={0} />
          {formatWad(tapEvent.netTransferAmount, { decimals: 4 })}
        </div>
      ) : null}
    </div>
  )
}
