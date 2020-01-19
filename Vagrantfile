# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/xenial64"

  # API
  config.vm.network "forwarded_port", guest: 40000, host: 40000

  # Redis
  config.vm.network "forwarded_port", guest: 6379, host: 6379
  config.vm.network "forwarded_port", guest: 6380, host: 6380
  config.vm.network "forwarded_port", guest: 6381, host: 6381
  config.vm.network "forwarded_port", guest: 6382, host: 6382
  config.vm.network "forwarded_port", guest: 6383, host: 6383
  config.vm.network "forwarded_port", guest: 6384, host: 6384
  config.vm.network "forwarded_port", guest: 6385, host: 6385

  # Postgres
  config.vm.network "forwarded_port", guest: 5432, host: 5432

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder "server", "/home/vagrant/server"

  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    # vb.gui = true

    # Customize the amount of memory on the VM:
    vb.memory = "2098"
  end

  # This is the default, but we need to define it explicitly for the env argument in the provisioner
  config.ssh.username = "vagrant"

  # Define a short script to make an unsynced node_modules folder within the synced api folder.
  # This dramatically speeds up npm installs and removes the need for some other workarounds
  unsynced_node_modules_script = <<-SHELL
    node_modules_path="/home/vagrant/server/node_modules"
    unsynced_node_modules_path="/home/vagrant/.unsynced_node_modules"
    sudo -u vagrant mkdir -p "$unsynced_node_modules_path"
    sudo -u vagrant mkdir -p "$node_modules_path"
    sudo mount --bind "$unsynced_node_modules_path" "$node_modules_path"
  SHELL

  config.vm.provision "shell",
    inline: <<-SHELL
    set -e

    sudo apt-get update

    echo "Install various sofware useful utilities and build deps"
    echo "Python & Co"
    sudo apt-get install -y python-pip python-dev python-setuptools
    echo "Useful Dev Utilities"
    sudo apt-get install -y ack-grep vim dos2unix git curl
    echo "Build Toolchain"
    sudo apt-get install -y make g++ libssl-dev build-essential gcc libkrb5-dev
    echo "Database Tools"
    sudo apt-get install -y redis-tools
    sudo apt-get install -y postgresql-client

    # Minimize clock skew errors that might disturb `make`; e.g. if it tries to process
    # a file that appears to be from the future
    #echo "Syncing with time service"
    #sudo timedatectl set-ntp no
    #sudo apt-get install -y ntp ntpdate
    #udo service ntp stop
    #sudo ntpd -b time.google.com
    #sudo service ntp start

    echo "Install docker"
    sudo apt-get install -y docker.io
    echo "Configure non-root access to docker for vagrant user"
    sudo gpasswd -a ubuntu docker
    sudo gpasswd -a vagrant docker
    sudo service docker restart
    newgrp docker

    echo "Pre-download containers we might find useful"
    sudo docker pull redis
    sudo docker pull postgres

    echo "Don't share the node_modules directory with the host OS, this wastes time and is expensive"
    #{unsynced_node_modules_script}

    echo "Install Node & NPM"
    curl -SL https://deb.nodesource.com/setup_11.x -o nodesource_setup.sh
    bash nodesource_setup.sh
    apt-get -y install nodejs

    echo "Use NPM to upgrade NPM"
    sudo npm install -g npm

    echo "Use NPM to install Node mdeps"
    npm install -g jake
    sudo -H -u vagrant bash -c "cd /home/vagrant/server; npm install"

    sudo npm install -g mocha

  SHELL

  # Normally we'd configure this to happen at boot with /etc/fstab, but I can't get that to work
  # within Vagrant for some reason
  config.trigger.after [:up, :resume, :reload] do |trigger|
    trigger.run_remote = {inline: unsynced_node_modules_script}
  end
end
