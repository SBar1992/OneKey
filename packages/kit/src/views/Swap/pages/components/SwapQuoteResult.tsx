import { memo, useCallback, useRef } from 'react';

import { useIntl } from 'react-intl';

import { Dialog, NumberSizeableText, YStack } from '@onekeyhq/components';
import {
  useSwapSelectFromTokenAtom,
  useSwapSelectToTokenAtom,
  useSwapSlippageDialogOpeningAtom,
  useSwapSlippagePercentageAtom,
  useSwapSlippagePercentageCustomValueAtom,
  useSwapSlippagePercentageModeAtom,
} from '@onekeyhq/kit/src/states/jotai/contexts/swap';
import { useSettingsPersistAtom } from '@onekeyhq/kit-bg/src/states/jotai/atoms';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import {
  ESwapSlippageSegmentKey,
  type IFetchQuoteResult,
  type ISwapSlippageSegmentItem,
} from '@onekeyhq/shared/types/swap/types';

import SwapCommonInfoItem from '../../components/SwapCommonInfoItem';
import SwapProviderInfoItem from '../../components/SwapProviderInfoItem';
import { useSwapQuoteLoading } from '../../hooks/useSwapState';

import SwapApproveAllowanceSelectContainer from './SwapApproveAllowanceSelectContainer';
import SwapSlippageContentContainer from './SwapSlippageContentContainer';
import SwapSlippageTriggerContainer from './SwapSlippageTriggerContainer';

interface ISwapQuoteResultProps {
  receivedAddress?: string;
  quoteResult: IFetchQuoteResult;
  onOpenProviderList?: () => void;
}

const SwapQuoteResult = ({
  onOpenProviderList,
  quoteResult,
}: ISwapQuoteResultProps) => {
  const [fromToken] = useSwapSelectFromTokenAtom();
  const [toToken] = useSwapSelectToTokenAtom();
  const [settingsPersistAtom] = useSettingsPersistAtom();
  const swapQuoteLoading = useSwapQuoteLoading();
  const intl = useIntl();
  const [, setSwapSlippageDialogOpening] = useSwapSlippageDialogOpeningAtom();
  const [{ slippageItem, autoValue }] = useSwapSlippagePercentageAtom();
  const [, setSwapSlippageCustomValue] =
    useSwapSlippagePercentageCustomValueAtom();
  const [, setSwapSlippageMode] = useSwapSlippagePercentageModeAtom();
  const dialogRef = useRef<ReturnType<typeof Dialog.show> | null>(null);
  const slippageOnSave = useCallback(
    (item: ISwapSlippageSegmentItem) => {
      setSwapSlippageMode(item.key);
      if (item.key === ESwapSlippageSegmentKey.CUSTOM) {
        setSwapSlippageCustomValue(item.value);
      }
      void dialogRef.current?.close();
    },
    [setSwapSlippageCustomValue, setSwapSlippageMode],
  );

  const slippageHandleClick = useCallback(() => {
    dialogRef.current = Dialog.show({
      title: intl.formatMessage({ id: ETranslations.slippage_tolerance_title }),
      renderContent: (
        <SwapSlippageContentContainer
          swapSlippage={slippageItem}
          autoValue={autoValue}
          onSave={slippageOnSave}
        />
      ),
      onOpen: () => {
        setSwapSlippageDialogOpening(true);
      },
      onClose: () => {
        setSwapSlippageDialogOpening(false);
      },
    });
  }, [
    intl,
    slippageItem,
    autoValue,
    slippageOnSave,
    setSwapSlippageDialogOpening,
  ]);

  return (
    <YStack space="$4">
      {quoteResult.allowanceResult ? (
        <SwapApproveAllowanceSelectContainer
          allowanceResult={quoteResult.allowanceResult}
          fromTokenSymbol={fromToken?.symbol ?? ''}
          isLoading={swapQuoteLoading}
        />
      ) : null}
      {quoteResult.info.provider ? (
        <SwapProviderInfoItem
          providerIcon={quoteResult.info.providerLogo ?? ''} // TODO default logo
          isLoading={swapQuoteLoading}
          rate={quoteResult.instantRate}
          fromToken={fromToken}
          toToken={toToken}
          // showBest={quoteResult.isBest}
          showLock={!!quoteResult.allowanceResult}
          onPress={() => {
            onOpenProviderList?.();
          }}
        />
      ) : null}
      {quoteResult.toAmount &&
      !quoteResult.allowanceResult &&
      !quoteResult.unSupportSlippage ? (
        <SwapSlippageTriggerContainer
          isLoading={swapQuoteLoading}
          onPress={slippageHandleClick}
        />
      ) : null}
      {quoteResult.fee?.estimatedFeeFiatValue ? (
        <SwapCommonInfoItem
          title={intl.formatMessage({
            id: ETranslations.swap_page_provider_est_network_fee,
          })}
          isLoading={swapQuoteLoading}
          valueComponent={
            <NumberSizeableText
              size="$bodyMdMedium"
              formatter="value"
              formatterOptions={{
                currency: settingsPersistAtom.currencyInfo.symbol,
              }}
            >
              {quoteResult.fee?.estimatedFeeFiatValue}
            </NumberSizeableText>
          }
        />
      ) : null}
    </YStack>
  );
};

export default memo(SwapQuoteResult);
