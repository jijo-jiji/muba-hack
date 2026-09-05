#!/usr/bin/env bash
# Creates a fresh, funded escrow vault on Sui testnet.
#
# A vault is single use: release_audited_milestone sets is_active = false, so
# every demo run (and every rehearsal) consumes one. Run this to get a new one,
# then put the printed id into NEXT_PUBLIC_ESCROW_VAULT_ID and into the seed
# job's escrowVaultId in src/lib/mockData.ts.
#
# Usage:  bash scripts/new-escrow-vault.sh [amount_usdc] [student_address]
set -euo pipefail

SUI="${SUI_BIN:-./tools/sui.exe}"
PKG=0x65220b620646127a170967e69ebedf0358e328f0c744833f9dde7d00f1775ff8
CAP=0x3014d018f3fe3f0765c0f7aefb989949f26503b3c3ff121f1f83997b8475c877
TREASURY=0x07d6119ab3de685fec1cc0fbdb104276291ccdf7e541c89292db779a5cde792b

AMOUNT_USDC="${1:-300}"
STUDENT="${2:-0x77e795d07e9caede106b6b9e16493bafafbf7d3a850372116382d37d6746d3a2}"
RAW=$(( AMOUNT_USDC * 1000000 ))
SIGNER=$("$SUI" client active-address)

echo "Minting ${AMOUNT_USDC} USDC to ${SIGNER}..."
COIN=$("$SUI" client call --package "$PKG" --module mock_usdc --function faucet \
  --args "$CAP" "$RAW" "$SIGNER" --gas-budget 50000000 --json \
  | python -c "import sys,json;r=sys.stdin.read();d=json.loads(r[r.find('{'):]);print([c['objectId'] for c in d.get('objectChanges',[]) if c.get('type')=='created' and 'Coin' in str(c.get('objectType',''))][0])")

echo "Creating vault holding ${AMOUNT_USDC} USDC for ${STUDENT}..."
"$SUI" client call --package "$PKG" --module escrow --function create_and_deposit \
  --type-args "${PKG}::mock_usdc::MOCK_USDC" \
  --args "$STUDENT" "$TREASURY" "$COIN" --gas-budget 50000000 --json \
  | python -c "
import sys,json
r=sys.stdin.read(); d=json.loads(r[r.find('{'):])
vault=[c['objectId'] for c in d.get('objectChanges',[]) if c.get('type')=='created' and 'EscrowVault' in str(c.get('objectType',''))][0]
print()
print('  NEW VAULT:', vault)
print('  tx       :', d.get('digest'))
print()
print('  Put that id in NEXT_PUBLIC_ESCROW_VAULT_ID and in mockData.ts,')
print('  then delete .trustmesh-data.json and restart the dev server.')
"
