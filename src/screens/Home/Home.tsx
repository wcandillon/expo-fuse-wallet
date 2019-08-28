import {Image, KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native'
import React, {useEffect, useState} from 'react'
import {WalletEffect, walletEffect} from '@/effects/wallet.effect'
import {useNavigation} from 'react-navigation-hooks'
import {walletStore} from '@/stores/wallet.store'
import {colors, images, metrics} from '@/themes'
import {AInput} from '@/components'
import {AButton} from '@/components/AButton/AButton'
import I18n from '@/i18n'
import {web3Store} from '@/stores/web3.store'

export const Home: React.FC = () => {
  const {navigate} = useNavigation()
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [assets, setAssets] = useState({})
  
  const BN = web3Store.web3.utils.BN as any
  const account: any = web3Store.web3.eth.accounts.privateKeyToAccount('0xb2a6b4e1e510fe05ab051c9944b433427d90f2d117e1b32248a1b811bcdb54f9')
  
  function makeBigNumber(amount, decimals) {
    try {
      // Allow .0
      if (amount.substr(0, 1) == '.') {
        amount = '0' + amount
      }
      let pieces = amount.split('.')
      let d = parseInt(decimals)
      if (pieces.length === 1) {
        amount = parseInt(amount)
        if (isNaN(amount) || amount < 0) {
          // error message
          return
        }
        amount = new BN(amount + '0'.repeat(parseInt(decimals)))
      } else if (pieces.length > 2) {
        console.log('error')
        // error message
        return
      } else if (pieces[1].length >= d) {
        console.log('error')
        return // error
      } else {
        let dec = parseInt(pieces[1])
        let reg = new RegExp('^\\d+$') // numbers only
        if (isNaN(pieces[1]) || dec < 0 || !reg.test(pieces[1])) {
          console.log('error')
          return
          // return error
        }
        dec = pieces[1]
        const declen = d - dec.toString().length
        amount = parseInt(pieces[0])
        if (isNaN(amount) || amount < 0) {
          console.log('error')
          // error message
          return
        }
        amount = new BN(amount + dec + '0'.repeat(declen))
      }
      return amount
    } catch (err) {
    }
  }
  
  useEffect(() => {
    setLoading(true)
    walletEffect
      .getAllBalances()
      .then(balances => {
        const balance = balances[walletEffect.FSN_TOKEN_ADDRESS] || 0
        setBalance(
          balance /
          WalletEffect.normalizeBalance(18)
        )
        setAssets(balances)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  
  async function onLogOut() {
    await walletStore.deletePrivateKey()
    navigate('AccessWallet')
  }
  
  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView behavior={'padding'} style={s.container}>
        <Image style={s.logo} source={images.logo}/>
        <Text style={s.titleScreen}>{I18n.t('walletInfo')}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{flex: 1}}>
            <Text style={s.textCategory}>{I18n.t('fusionBalance')}: </Text>
            <View style={s.wrapBalance}>
              <Text style={s.textBalance}>
                {loading ? 'Loading...' : `${balance}`}{' '}
                <Text style={s.textCategory}>FSN</Text>
              </Text>
            </View>
            <View style={s.publicAddressCover}>
              <Text style={s.textCategory}>{I18n.t('publicAddress')}:</Text>
              <Text style={s.textPublicAddress}>
                {walletStore.wallet.address}
              </Text>
            </View>
          </View>
          
          <View style={s.wrapInput}>
            <Text style={s.titleFeature}>{I18n.t('assetCreation')}</Text>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <AInput name={I18n.t('assetName')}/>
              <AInput name={I18n.t('supply')}/>
              <AButton positions="right" size="small" title={I18n.t('createAssets')} onPress={() => {
                // priv key
//                let totalSupplyString = totalSupply.toString();
//                let totalSupplyBN = $scope.makeBigNumber(totalSupplyString, decimals);
//                let totalSupplyBNHex = "0x" + totalSupplyBN.toString(16);
                
                web3Store.fusion.fsntx.buildGenAssetTx({
                  'from': '0x02b0a51473e9076ae2667b536f9b11077a50b791', // public key
                  'name': 'vtv3-token',
                  'symbol': 'VTV3',
                  'decimals': 18,
                  'total': '0x21e19e0c9bab2400000',
                  'description': '{}',
                  'canChange': false
                })
                  .then(tx => {
                    console.log(tx)
                    tx.chainId = 46688
                    tx.from = '0x02b0a51473e9076ae2667b536f9b11077a50b791'
                    const gasPrice = web3Store.web3.utils.toWei(new BN(100), 'gwei' as any)
                    tx.gasPrice = gasPrice.toString()
                    
                    return web3Store.fusion.fsn.signAndTransmit(tx, account.signTransaction)
                      .then(txHash => {
                        console.log('txHash ', txHash)
                      }).catch(err => {
                        console.log('err1', err)
                      })
                  })
                  .catch(err => {
                    console.log(err)
                  })
              }}/>
            </View>
          </View>
          
          <View style={s.wrapInput}>
            <Text style={s.titleFeature}>{I18n.t('sendAsset')}</Text>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <AInput name={I18n.t('to')}/>
              <AInput name={I18n.t('quantity')}/>
              <AButton positions="right" size="small" title={I18n.t('sendAsset')}
                       onPress={() => {
                         const asset = '0x6d8b839b25cae5d9316e2d422983b4b32e54979cb05163d08d61e64b95c8dd68'
  
                         const amountBNString = new BN(5).toString()
                         const amount = makeBigNumber(amountBNString, 0)
                         
                         console.log(amount)
                         
                         web3Store.fusion.fsntx.buildSendAssetTx({
                           from: '0x02b0a51473e9076ae2667b536f9b11077a50b791',
                           to: '0X373974CA4F8985F6FA51AB3F7DE3DD61473BA702',
                           value: amount.toString(),
                           asset,
                         })
                           .then(tx => {
                             tx.from = '0x02b0a51473e9076ae2667b536f9b11077a50b791'
                             tx.chainId = 46688
                             
                             return web3Store.fusion.fsn.signAndTransmit(tx, account.signTransaction)
                           })
                           .then(txHash => {
                             console.log(txHash)
                           })
                           .catch(err => {
                             console.log('err ', err)
                           })
                       }}
              />
            </View>
          </View>
          <AButton onPress={onLogOut} title={I18n.t('logout')}/>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: metrics.padding.base,
    marginBottom: metrics.margin.base
  },
  logo: {
    height: metrics.logo.height,
    width: metrics.logo.width,
    marginLeft: -metrics.margin.base
  },
  titleScreen: {
    textDecorationLine: 'underline',
    fontWeight: '700',
    marginTop: metrics.margin.base,
    marginBottom: metrics.margin.double,
    fontSize: metrics.font.header.h1,
    textAlign: 'center',
    color: colors.text.primary
  },
  wrapBalance: {
    marginVertical: metrics.margin.base,
    justifyContent: 'center'
  },
  textBalance: {
    fontSize: metrics.font.coin,
    fontWeight: '700',
    color: colors.text.primary
  },
  publicAddressCover: {
    marginBottom: metrics.margin.triple
  },
  textPublicAddress: {
    fontSize: metrics.font.text.t3,
    fontWeight: '600',
    color: colors.text.primary
  },
  textCategory: {
    fontSize: metrics.font.header.h2,
    color: colors.text.primary
  },
  titleFeature: {
    fontSize: metrics.font.header.h2,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: colors.text.primary,
    marginBottom: metrics.margin.double
  },
  wrapInput: {
    flex: 1,
    paddingHorizontal: metrics.padding.base,
    marginBottom: metrics.padding.base
  }
})
