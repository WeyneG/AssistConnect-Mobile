import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type BottomTabKey = string;

type BottomTabItem = {
    key: BottomTabKey;
    label: string;
    activeIcon: React.ComponentProps<typeof Ionicons>['name'];
    inactiveIcon: React.ComponentProps<typeof Ionicons>['name'];
};

interface BottomTabBarProps {
    tabs: BottomTabItem[];
    activeTab: BottomTabKey;
    onTabPress: (tab: BottomTabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ tabs, activeTab, onTabPress }) => (
    <View style={styles.bottomNav}>
        {tabs.map(tab => {
            const isActive = tab.key === activeTab;
            return (
                <TouchableOpacity key={tab.key} style={styles.navItem} onPress={() => onTabPress(tab.key)} activeOpacity={0.75}>
                    {isActive
                        ? <View style={styles.navItemActive}><Ionicons name={tab.activeIcon} size={22} color="#8297D9" /></View>
                        : <Ionicons name={tab.inactiveIcon} size={22} color="#9CA3AF" />
                    }
                    <Text style={isActive ? styles.navItemTextActive : styles.navItemText}>{tab.label}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const styles = StyleSheet.create({
    bottomNav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 8, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    navItem: { flex: 1, alignItems: 'center', gap: 4 },
    navItemActive: { backgroundColor: '#EEF2FF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    navItemText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
    navItemTextActive: { fontSize: 11, color: '#8297D9', fontWeight: '600' },
});
