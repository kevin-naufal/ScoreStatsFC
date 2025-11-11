import os
import shutil
from pathlib import Path

def main():
    try:
        import kagglehub  # pip install kagglehub
    except ImportError:
        print("Error: kagglehub belum terpasang. Jalankan: pip install kagglehub")
        raise

    # Unduh dataset
    print("Mengunduh dataset Kaggle...")
    path = kagglehub.dataset_download("orkunaktas/all-football-players-stats-in-top-5-leagues-2324")
    print("Path dataset:", path)

    dataset_dir = Path(path)
    csv_files = list(dataset_dir.rglob('*.csv'))
    if not csv_files:
        raise FileNotFoundError("Tidak ditemukan file CSV dalam dataset ini.")

    # Ambil CSV terbesar sebagai kandidat utama
    csv_files.sort(key=lambda p: p.stat().st_size, reverse=True)
    source_csv = csv_files[0]
    print("Memilih CSV:", source_csv)

    # Salin ke public/data dengan nama standar
    project_root = Path(__file__).resolve().parents[2]
    public_data = project_root / 'public' / 'data'
    public_data.mkdir(parents=True, exist_ok=True)
    target_csv = public_data / 'players_top5_2324.csv'

    shutil.copy2(source_csv, target_csv)
    print("CSV tersalin ke:", target_csv)

if __name__ == '__main__':
    main()


