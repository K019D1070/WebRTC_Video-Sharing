# ローカルTCP/IPネットワークに最適化された映像配信システム

## はじめに

弊校では、部屋単位での仮設映像配信にWeb会議サービスを用いている。

これはWeb会議サービスの意図された用法ではないが、映像スイッチャーの購入コストや映像配線の手間を考えると、Web会議サービスを仮設映像配信に用いるのも手段の一つになる。

数人単位であれば、使い慣れたツールをそのまま転用することで運用に係るコストの削減に価するが、参加者が数十人クラスになると、通信帯域の逼迫が顕著となる。(一例として、2022年5月現在Zoomは参加者がホストを含めて2人の場合にのみP2Pによる通信を行っているが、3人以上では通信が必ずZoomのサーバーを経由するため、インターネット回線を圧迫する。)

一般に、動画ストリーミングに耐えうるインターネット回線を仮設することは、ランニングコストや設備の面から難しい。
しかし、ローカルエリアネットワーク(以下LAN)であれば比較的性能の高い無線アクセスポイント(無線AP)を数台用意すれば、仮設でも十分な帯域を確保できるだろう。

これを実証するために、｢通信がローカルエリアネットワーク内で完結する動画ストリーミングシステム｣を製作・運用した。

## 設計

システムを設計するにあたっては以下の要件を設定した。

- - -
* 設置・運用に係る人的コストを抑える

-> Web会議システムを用いるよりも楽であることにより、導入のハードルを下げることを狙う

* フレキシブル・スケーラブル

-> 様々な接続形態に対応できるように

-> 数十～数百の接続に耐えられるようにする
- - -

これらの要件を満たすために、配信・視聴のクライアントアプリケーションをブラウザベースとしたシステム設計をおこなう。

専用の機器を用いずにノートPCなどでシステムを構成できれば、手持ちの機器を転用できて経済的であるし、新規にクライアントソフトなどをインストールする手間が省ける。

また、視聴者側でも各自の端末での視聴が容易になる。

そして、視聴者と配信者が明確に分かれていないような接続形態も可能になり、Web会議サービスを仮設映像配信に使うのとは逆に、参加者が全てネットワーク的に近いなどの限定的なケースにおいてはWeb会議システムの代替となることをも期待できる。

### 詳細要件

WebRTCについて書く