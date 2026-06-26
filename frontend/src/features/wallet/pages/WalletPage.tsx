import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import WalletHeader from "../components/WalletHeader/WalletHeader";
import SummaryHeader from "../components/SummaryHeader/SummaryHeader";
import WalletCard from "../components/WalletCard/WalletCard";
import AddWalletCard from "../components/AddWalletCard/AddWalletCard";
import AddWalletModal from "../components/AddWalletModal/AddWalletModal";
import EditWalletModal from "../components/EditWalletModal/EditWalletModal";
import { useWallets } from "../hooks/useWallets";
import type { Wallet } from "../types/wallet";
import styles from "./WalletPage.module.css";

const WalletPage: React.FC = () => {
  const { wallets, totalBalance, activeCount, isLoading, error, setWallets, deleteWallet } =
    useWallets();
  const [showModal, setShowModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const handleWalletAdded = (wallet: Wallet) => {
    setWallets((prev) => [...prev, wallet]);
  };

  const handleWalletUpdated = (wallet: Wallet) => {
    setWallets((prev) => prev.map((w) => w.wallet_id === wallet.wallet_id ? wallet : w));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>Đang tải dữ liệu ví...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <WalletHeader onAddWallet={() => setShowModal(true)} />

        <SummaryHeader
          totalBalance={totalBalance}
          walletCount={wallets.length}
          activeCount={activeCount}
        />

        <div className={styles.grid}>
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.wallet_id}
              wallet={wallet}
              onEdit={(w) => setEditingWallet(w)}
              onDelete={(w) => {
                if (window.confirm(`Xoá ví "${w.name}"?`)) {
                  deleteWallet(w.wallet_id);
                }
              }}
            />
          ))}
          <AddWalletCard onClick={() => setShowModal(true)} />
        </div>
      </div>

      {showModal && (
        <AddWalletModal
          onClose={() => setShowModal(false)}
          onAdded={handleWalletAdded}
        />
      )}

      {editingWallet && (
        <EditWalletModal
          wallet={editingWallet}
          onClose={() => setEditingWallet(null)}
          onUpdated={handleWalletUpdated}
        />
      )}
    </MainLayout>
  );
};

export default WalletPage;
