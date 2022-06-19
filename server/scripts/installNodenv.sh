#!/usr/bin/env bash
defaultPath=`pwd`
git clone https://github.com/nodenv/nodenv.git ~/.nodenv
cd ~/.nodenv && src/configure && make -C src
echo 'export PATH="$HOME/.nodenv/bin:$PATH"' >> ~/.bash_profile
echo 'export PATH="$HOME/.nodenv/bin:$PATH"' >> ~/.bashrc
~/.nodenv/bin/nodenv init
echo "eval \"\$(nodenv init -)\"" >> ~/.bashrc
source ~/.bashrc
cd $defaultPath
git clone https://github.com/nodenv/node-build.git
sudo PREFIX=/usr/local ./node-build/install.sh